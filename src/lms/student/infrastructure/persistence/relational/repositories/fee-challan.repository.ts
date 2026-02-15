import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { FeeChallanEntity } from '../entities/fee-challan.entity';
import { FeeChallanRepository } from '../../fee-challan.repository';
import { FeeChallanMapper } from '../mappers/fee-challan.mapper';
import { FeeChallan } from '../../../../domain/fee-challan';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { PaymentStatusEnum } from '../../../../../common/enums/payment-status.enum';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class FeeChallanRelationalRepository implements FeeChallanRepository {
  constructor(
    @InjectRepository(FeeChallanEntity)
    private readonly repo: Repository<FeeChallanEntity>,
    private readonly tenantContext: TenantContextService,
  ) {}

  private getTenantFilter(): Record<string, unknown> {
    if (this.tenantContext.hasContext()) {
      const filter: Record<string, unknown> = {
        tenantId: this.tenantContext.getTenantId(),
      };
      const branchId = this.tenantContext.getBranchId();
      if (branchId) filter.branchId = branchId;
      return filter;
    }
    return {};
  }

  async create(
    data: Omit<FeeChallan, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<FeeChallan> {
    const persistenceModel = this.repo.create(
      FeeChallanMapper.toPersistence(data as FeeChallan),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return FeeChallanMapper.toDomain(saved);
  }

  async findAll(): Promise<FeeChallan[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(FeeChallanMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<FeeChallan>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? FeeChallanMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<FeeChallan>,
  ): Promise<FeeChallan | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        FeeChallanMapper.toPersistence({
          ...FeeChallanMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return FeeChallanMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }

  // ── Extended methods for Fee Management ──

  async findByChallanNumber(
    challanNumber: string,
  ): Promise<NullableType<FeeChallan>> {
    const entity = await this.repo.findOne({
      where: { challanNumber, ...this.getTenantFilter() } as any,
    });
    return entity ? FeeChallanMapper.toDomain(entity) : null;
  }

  async findByStudentId(studentId: number): Promise<FeeChallan[]> {
    const entities = await this.repo.find({
      where: { student: { id: studentId }, ...this.getTenantFilter() } as any,
    });
    return entities.map(FeeChallanMapper.toDomain);
  }

  async findByStudentAndStructureAndInstallment(
    studentId: number,
    feeStructureId: number,
    installmentIndex: number,
  ): Promise<NullableType<FeeChallan>> {
    const entity = await this.repo.findOne({
      where: {
        student: { id: studentId },
        feeStructure: { id: feeStructureId },
        remarks:
          installmentIndex !== undefined
            ? Like(`%Installment #${installmentIndex}%`)
            : (undefined as any),
        ...this.getTenantFilter(),
      } as any,
    });
    return entity ? FeeChallanMapper.toDomain(entity) : null;
  }

  async findPendingByClassId(classId: number): Promise<FeeChallan[]> {
    const qb = this.repo
      .createQueryBuilder('challan')
      .leftJoinAndSelect('challan.student', 'student')
      .leftJoin(
        'student_enrollment',
        'enrollment',
        'enrollment."studentId" = student.id',
      )
      .where('enrollment."gradeClassId" = :classId', { classId })
      .andWhere('challan.status IN (:...statuses)', {
        statuses: [PaymentStatusEnum.pending, PaymentStatusEnum.partial],
      });
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter.tenantId) {
      qb.andWhere('challan.tenantId = :tenantId', {
        tenantId: tenantFilter.tenantId,
      });
      if (tenantFilter.branchId) {
        qb.andWhere('challan.branchId = :branchId', {
          branchId: tenantFilter.branchId,
        });
      }
    }
    const entities = await qb.getMany();
    return entities.map(FeeChallanMapper.toDomain);
  }

  async getLastChallanNumberForYear(year: number): Promise<string | null> {
    const prefix = `CH-${year}-`;
    const qb = this.repo
      .createQueryBuilder('challan')
      .where('challan."challanNumber" LIKE :prefix', {
        prefix: `${prefix}%`,
      })
      .orderBy('challan."challanNumber"', 'DESC');
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter.tenantId) {
      qb.andWhere('challan.tenantId = :tenantId', {
        tenantId: tenantFilter.tenantId,
      });
      if (tenantFilter.branchId) {
        qb.andWhere('challan.branchId = :branchId', {
          branchId: tenantFilter.branchId,
        });
      }
    }
    const entity = await qb.getOne();
    return entity?.challanNumber ?? null;
  }
}
