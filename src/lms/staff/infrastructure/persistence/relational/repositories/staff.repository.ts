import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffEntity } from '../entities/staff.entity';
import { Staff } from '../../../../domain/staff';
import { StaffRepository } from '../../staff.repository';
import { StaffMapper } from '../mappers/staff.mapper';
import { DeepPartial } from '../../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class StaffRelationalRepository implements StaffRepository {
  constructor(
    @InjectRepository(StaffEntity)
    private readonly repo: Repository<StaffEntity>,
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

  async create(data: DeepPartial<Staff>): Promise<Staff> {
    const entity = this.repo.create(data as any) as unknown as StaffEntity;
    if (this.tenantContext.hasContext()) {
      (entity as any).tenantId = this.tenantContext.getTenantId();
      (entity as any).branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(entity);
    return StaffMapper.toDomain(saved);
  }

  async findAll(): Promise<Staff[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(StaffMapper.toDomain);
  }

  async findById(id: Staff['id']): Promise<NullableType<Staff>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? StaffMapper.toDomain(entity) : null;
  }

  async update(
    id: Staff['id'],
    data: DeepPartial<Staff>,
  ): Promise<Staff | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? StaffMapper.toDomain(entity) : null;
  }

  async remove(id: Staff['id']): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
