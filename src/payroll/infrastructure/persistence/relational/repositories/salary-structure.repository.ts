import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaryStructureEntity } from '../entities/salary-structure.entity';
import { SalaryStructure } from '../../../../domain/salary-structure';
import { SalaryStructureRepository } from '../../salary-structure.repository';
import { SalaryStructureMapper } from '../mappers/salary-structure.mapper';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class SalaryStructureRelationalRepository
  implements SalaryStructureRepository
{
  constructor(
    @InjectRepository(SalaryStructureEntity)
    private readonly repo: Repository<SalaryStructureEntity>,
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

  async create(data: DeepPartial<SalaryStructure>): Promise<SalaryStructure> {
    const entity = this.repo.create(
      data as any,
    ) as unknown as SalaryStructureEntity;
    if (this.tenantContext.hasContext()) {
      entity.tenantId = this.tenantContext.getTenantId();
      entity.branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(entity);
    return SalaryStructureMapper.toDomain(saved);
  }

  async findAll(): Promise<SalaryStructure[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
      order: { createdAt: 'DESC' },
    });
    return entities.map(SalaryStructureMapper.toDomain);
  }

  async findById(
    id: SalaryStructure['id'],
  ): Promise<NullableType<SalaryStructure>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? SalaryStructureMapper.toDomain(entity) : null;
  }

  async findByStaffId(staffId: number): Promise<NullableType<SalaryStructure>> {
    const entity = await this.repo.findOne({
      where: { staffId, isActive: true, ...this.getTenantFilter() } as any,
      order: { createdAt: 'DESC' },
    });
    return entity ? SalaryStructureMapper.toDomain(entity) : null;
  }

  async findActiveByTenant(): Promise<SalaryStructure[]> {
    const entities = await this.repo.find({
      where: { isActive: true, ...this.getTenantFilter() } as any,
    });
    return entities.map(SalaryStructureMapper.toDomain);
  }

  async update(
    id: SalaryStructure['id'],
    data: DeepPartial<SalaryStructure>,
  ): Promise<SalaryStructure | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? SalaryStructureMapper.toDomain(entity) : null;
  }

  async remove(id: SalaryStructure['id']): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
