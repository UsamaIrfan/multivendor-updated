import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { StaffMgmtEntity } from '../entities/staff-mgmt.entity';
import { StaffMgmt } from '../../../../domain/staff-mgmt';
import { StaffMgmtRepository } from '../../staff-mgmt.repository';
import { StaffMgmtMapper } from '../mappers/staff-mgmt.mapper';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class StaffMgmtRelationalRepository implements StaffMgmtRepository {
  constructor(
    @InjectRepository(StaffMgmtEntity)
    private readonly repo: Repository<StaffMgmtEntity>,
    private readonly tenantContext: TenantContextService,
  ) {}

  private getTenantFilter(): Record<string, unknown> {
    if (this.tenantContext.hasContext()) {
      const filter: Record<string, unknown> = {
        tenantId: this.tenantContext.getTenantId(),
      };
      return filter;
    }
    return {};
  }

  async create(data: DeepPartial<StaffMgmt>): Promise<StaffMgmt> {
    const persistenceModel = this.repo.create(
      StaffMgmtMapper.toPersistence(data as StaffMgmt),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return StaffMgmtMapper.toDomain(saved);
  }

  async findAll(): Promise<StaffMgmt[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
      relations: ['branchAssignments', 'institution', 'department'],
    });
    return entities.map(StaffMgmtMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<StaffMgmt>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
      relations: ['institution', 'department'],
    });
    return entity ? StaffMgmtMapper.toDomain(entity) : null;
  }

  async findByIdWithAssignments(id: number): Promise<NullableType<StaffMgmt>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
      relations: ['branchAssignments', 'institution', 'department'],
    });
    return entity ? StaffMgmtMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    data: DeepPartial<StaffMgmt>,
  ): Promise<StaffMgmt | null> {
    const persistenceModel = StaffMgmtMapper.toPersistence({
      id,
      ...data,
    } as StaffMgmt);
    await this.repo.save(persistenceModel);
    return this.findByIdWithAssignments(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }

  async findLastByStaffIdPrefix(
    prefix: string,
  ): Promise<NullableType<Pick<StaffMgmt, 'staffId'>>> {
    const entity = await this.repo.findOne({
      where: {
        ...this.getTenantFilter(),
        staffId: Like(`${prefix}%`),
      } as any,
      order: { staffId: 'DESC' },
      select: ['id', 'staffId'],
    });
    return entity ? { staffId: entity.staffId } : null;
  }

  async findByBranch(branchId: string): Promise<StaffMgmt[]> {
    if (!this.tenantContext.hasContext()) {
      return [];
    }
    const entities = await this.repo
      .createQueryBuilder('staff')
      .innerJoin('staff.branchAssignments', 'assignment')
      .where('staff.tenantId = :tenantId', {
        tenantId: this.tenantContext.getTenantId(),
      })
      .andWhere('assignment.branchId = :branchId', { branchId })
      .leftJoinAndSelect('staff.branchAssignments', 'allAssignments')
      .leftJoinAndSelect('staff.user', 'user')
      .leftJoinAndSelect('staff.institution', 'institution')
      .leftJoinAndSelect('staff.department', 'department')
      .getMany();
    return entities.map(StaffMgmtMapper.toDomain);
  }

  async findByUserId(userId: number): Promise<NullableType<StaffMgmt>> {
    const entity = await this.repo.findOne({
      where: {
        user: { id: userId },
        ...this.getTenantFilter(),
      } as any,
      relations: ['institution', 'department'],
    });
    return entity ? StaffMgmtMapper.toDomain(entity) : null;
  }
}
