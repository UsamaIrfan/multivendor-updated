import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffAttendanceEntity } from '../entities/staff-attendance.entity';
import { StaffAttendance } from '../../../../domain/staff-attendance';
import { StaffAttendanceRepository } from '../../staff-attendance.repository';
import { StaffAttendanceMapper } from '../mappers/staff-attendance.mapper';
import { DeepPartial } from '../../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class StaffAttendanceRelationalRepository
  implements StaffAttendanceRepository
{
  constructor(
    @InjectRepository(StaffAttendanceEntity)
    private readonly repo: Repository<StaffAttendanceEntity>,
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

  async create(data: DeepPartial<StaffAttendance>): Promise<StaffAttendance> {
    const entity = this.repo.create(
      data as any,
    ) as unknown as StaffAttendanceEntity;
    if (this.tenantContext.hasContext()) {
      (entity as any).tenantId = this.tenantContext.getTenantId();
      (entity as any).branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(entity);
    return StaffAttendanceMapper.toDomain(saved);
  }

  async findAll(): Promise<StaffAttendance[]> {
    const entities = await this.repo.find({ where: { ...this.getTenantFilter() } as any });
    return entities.map(StaffAttendanceMapper.toDomain);
  }

  async findById(
    id: StaffAttendance['id'],
  ): Promise<NullableType<StaffAttendance>> {
    const entity = await this.repo.findOne({ where: { id, ...this.getTenantFilter() } as any });
    return entity ? StaffAttendanceMapper.toDomain(entity) : null;
  }

  async update(
    id: StaffAttendance['id'],
    data: DeepPartial<StaffAttendance>,
  ): Promise<StaffAttendance | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({ where: { id, ...this.getTenantFilter() } as any });
    return entity ? StaffAttendanceMapper.toDomain(entity) : null;
  }

  async remove(id: StaffAttendance['id']): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
