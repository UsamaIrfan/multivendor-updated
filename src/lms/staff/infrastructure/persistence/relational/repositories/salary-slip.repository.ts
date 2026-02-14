import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalarySlipEntity } from '../entities/salary-slip.entity';
import { SalarySlip } from '../../../../domain/salary-slip';
import { SalarySlipRepository } from '../../salary-slip.repository';
import { SalarySlipMapper } from '../mappers/salary-slip.mapper';
import { DeepPartial } from '../../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class SalarySlipRelationalRepository implements SalarySlipRepository {
  constructor(
    @InjectRepository(SalarySlipEntity)
    private readonly repo: Repository<SalarySlipEntity>,
    private readonly tenantContext: TenantContextService,
  ) {}

  private getTenantFilter(): Record<string, unknown> {
    if (this.tenantContext.hasContext()) {
      const filter: Record<string, unknown> = { tenantId: this.tenantContext.getTenantId() };
      const branchId = this.tenantContext.getBranchId();
      if (branchId) filter.branchId = branchId;
      return filter;
    }
    return {};
  }

  async create(data: DeepPartial<SalarySlip>): Promise<SalarySlip> {
    const entity = this.repo.create(data as any) as unknown as SalarySlipEntity;
    if (this.tenantContext.hasContext()) {
      (entity as any).tenantId = this.tenantContext.getTenantId();
      (entity as any).branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(entity);
    return SalarySlipMapper.toDomain(saved);
  }

  async findAll(): Promise<SalarySlip[]> {
    const entities = await this.repo.find({ where: { ...this.getTenantFilter() } as any });
    return entities.map(SalarySlipMapper.toDomain);
  }

  async findById(id: SalarySlip['id']): Promise<NullableType<SalarySlip>> {
    const entity = await this.repo.findOne({ where: { id, ...this.getTenantFilter() } as any });
    return entity ? SalarySlipMapper.toDomain(entity) : null;
  }

  async update(
    id: SalarySlip['id'],
    data: DeepPartial<SalarySlip>,
  ): Promise<SalarySlip | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({ where: { id, ...this.getTenantFilter() } as any });
    return entity ? SalarySlipMapper.toDomain(entity) : null;
  }

  async remove(id: SalarySlip['id']): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
