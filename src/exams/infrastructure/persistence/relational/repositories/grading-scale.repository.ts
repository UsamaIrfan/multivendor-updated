import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradingScaleEntity } from '../entities/grading-scale.entity';
import { GradingScaleRepository } from '../../grading-scale.repository';
import { GradingScaleMapper } from '../mappers/grading-scale.mapper';
import { GradingScale } from '../../../../domain/grading-scale';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class GradingScaleRelationalRepository
  implements GradingScaleRepository
{
  constructor(
    @InjectRepository(GradingScaleEntity)
    private readonly repo: Repository<GradingScaleEntity>,
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
    data: Omit<GradingScale, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<GradingScale> {
    const persistenceModel = this.repo.create(
      GradingScaleMapper.toPersistence(data as GradingScale),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return GradingScaleMapper.toDomain(saved);
  }

  async findAll(): Promise<GradingScale[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(GradingScaleMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<GradingScale>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? GradingScaleMapper.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<NullableType<GradingScale>> {
    const entity = await this.repo.findOne({
      where: { name, ...this.getTenantFilter() } as any,
    });
    return entity ? GradingScaleMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<GradingScale>,
  ): Promise<GradingScale | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        GradingScaleMapper.toPersistence({
          ...GradingScaleMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return GradingScaleMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
