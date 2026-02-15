import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { ConcessionEntity } from '../entities/concession.entity';
import { ConcessionRepository } from '../../concession.repository';
import { ConcessionMapper } from '../mappers/concession.mapper';
import { Concession } from '../../../../domain/concession';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class ConcessionRelationalRepository implements ConcessionRepository {
  constructor(
    @InjectRepository(ConcessionEntity)
    private readonly repo: Repository<ConcessionEntity>,
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
    data: Omit<Concession, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Concession> {
    const persistenceModel = this.repo.create(
      ConcessionMapper.toPersistence(data as Concession),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return ConcessionMapper.toDomain(saved);
  }

  async findAll(): Promise<Concession[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
      relations: ['student'],
    });
    return entities.map(ConcessionMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<Concession>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
      relations: ['student'],
    });
    return entity ? ConcessionMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<Concession>,
  ): Promise<Concession | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        ConcessionMapper.toPersistence({
          ...ConcessionMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return ConcessionMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }

  async findActiveByStudentId(
    studentId: number,
    asOfDate?: Date,
  ): Promise<Concession[]> {
    const date = asOfDate ?? new Date();
    const entities = await this.repo.find({
      where: {
        student: { id: studentId },
        approved: true,
        validFrom: LessThanOrEqual(date),
        validTo: MoreThanOrEqual(date),
        ...this.getTenantFilter(),
      } as any,
      relations: ['student'],
    });
    return entities.map(ConcessionMapper.toDomain);
  }
}
