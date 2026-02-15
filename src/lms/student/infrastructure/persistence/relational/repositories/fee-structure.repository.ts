import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeStructureEntity } from '../entities/fee-structure.entity';
import { FeeStructureRepository } from '../../fee-structure.repository';
import { FeeStructureMapper } from '../mappers/fee-structure.mapper';
import { FeeStructure } from '../../../../domain/fee-structure';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class FeeStructureRelationalRepository
  implements FeeStructureRepository
{
  constructor(
    @InjectRepository(FeeStructureEntity)
    private readonly repo: Repository<FeeStructureEntity>,
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
    data: Omit<FeeStructure, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<FeeStructure> {
    const persistenceModel = this.repo.create(
      FeeStructureMapper.toPersistence(data as FeeStructure),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return FeeStructureMapper.toDomain(saved);
  }

  async findAll(): Promise<FeeStructure[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(FeeStructureMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<FeeStructure>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? FeeStructureMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<FeeStructure>,
  ): Promise<FeeStructure | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        FeeStructureMapper.toPersistence({
          ...FeeStructureMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return FeeStructureMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
