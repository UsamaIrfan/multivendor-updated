import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollSlipEntity } from '../entities/payroll-slip.entity';
import { PayrollSlip } from '../../../../domain/payroll-slip';
import { PayrollSlipRepository } from '../../payroll-slip.repository';
import { PayrollSlipMapper } from '../mappers/payroll-slip.mapper';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class PayrollSlipRelationalRepository implements PayrollSlipRepository {
  constructor(
    @InjectRepository(PayrollSlipEntity)
    private readonly repo: Repository<PayrollSlipEntity>,
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

  async create(data: DeepPartial<PayrollSlip>): Promise<PayrollSlip> {
    const entity = this.repo.create(
      data as any,
    ) as unknown as PayrollSlipEntity;
    if (this.tenantContext.hasContext()) {
      entity.tenantId = this.tenantContext.getTenantId();
      entity.branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(entity);
    return PayrollSlipMapper.toDomain(saved);
  }

  async findAll(): Promise<PayrollSlip[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
      order: { year: 'DESC', month: 'DESC' },
    });
    return entities.map(PayrollSlipMapper.toDomain);
  }

  async findById(id: PayrollSlip['id']): Promise<NullableType<PayrollSlip>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? PayrollSlipMapper.toDomain(entity) : null;
  }

  async findByStaffAndMonth(
    staffId: number,
    month: number,
    year: number,
  ): Promise<NullableType<PayrollSlip>> {
    const tenantFilter: Record<string, unknown> = {};
    if (this.tenantContext.hasContext()) {
      tenantFilter.tenantId = this.tenantContext.getTenantId();
    }
    const entity = await this.repo.findOne({
      where: { staffId, month, year, ...tenantFilter } as any,
    });
    return entity ? PayrollSlipMapper.toDomain(entity) : null;
  }

  async findByMonth(month: number, year: number): Promise<PayrollSlip[]> {
    const entities = await this.repo.find({
      where: { month, year, ...this.getTenantFilter() } as any,
    });
    return entities.map(PayrollSlipMapper.toDomain);
  }

  async update(
    id: PayrollSlip['id'],
    data: DeepPartial<PayrollSlip>,
  ): Promise<PayrollSlip | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? PayrollSlipMapper.toDomain(entity) : null;
  }

  async remove(id: PayrollSlip['id']): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
