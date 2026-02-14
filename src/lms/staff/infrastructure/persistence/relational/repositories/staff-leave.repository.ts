import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffLeaveEntity } from '../entities/staff-leave.entity';
import { StaffLeave } from '../../../../domain/staff-leave';
import { StaffLeaveRepository } from '../../staff-leave.repository';
import { StaffLeaveMapper } from '../mappers/staff-leave.mapper';
import { DeepPartial } from '../../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class StaffLeaveRelationalRepository implements StaffLeaveRepository {
  constructor(
    @InjectRepository(StaffLeaveEntity)
    private readonly repo: Repository<StaffLeaveEntity>,
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

  async create(data: DeepPartial<StaffLeave>): Promise<StaffLeave> {
    const entity = this.repo.create(data as any) as unknown as StaffLeaveEntity;
    if (this.tenantContext.hasContext()) {
      (entity as any).tenantId = this.tenantContext.getTenantId();
      (entity as any).branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(entity);
    return StaffLeaveMapper.toDomain(saved);
  }

  async findAll(): Promise<StaffLeave[]> {
    const entities = await this.repo.find({ where: { ...this.getTenantFilter() } as any });
    return entities.map(StaffLeaveMapper.toDomain);
  }

  async findById(id: StaffLeave['id']): Promise<NullableType<StaffLeave>> {
    const entity = await this.repo.findOne({ where: { id, ...this.getTenantFilter() } as any });
    return entity ? StaffLeaveMapper.toDomain(entity) : null;
  }

  async update(
    id: StaffLeave['id'],
    data: DeepPartial<StaffLeave>,
  ): Promise<StaffLeave | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({ where: { id, ...this.getTenantFilter() } as any });
    return entity ? StaffLeaveMapper.toDomain(entity) : null;
  }

  async remove(id: StaffLeave['id']): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
