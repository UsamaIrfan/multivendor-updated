import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { StaffAttendanceRecordEntity } from '../entities/staff-attendance-record.entity';
import { StaffAttendanceRecord } from '../../../../domain/staff-attendance-record';
import { StaffAttendanceRecordRepository } from '../../staff-attendance-record.repository';
import { StaffAttendanceRecordMapper } from '../mappers/staff-attendance-record.mapper';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class StaffAttendanceRecordRelationalRepository
  implements StaffAttendanceRecordRepository
{
  constructor(
    @InjectRepository(StaffAttendanceRecordEntity)
    private readonly repo: Repository<StaffAttendanceRecordEntity>,
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
    data: DeepPartial<StaffAttendanceRecord>,
  ): Promise<StaffAttendanceRecord> {
    const entity = this.repo.create(
      StaffAttendanceRecordMapper.toPersistence(data as StaffAttendanceRecord),
    );
    if (this.tenantContext.hasContext()) {
      entity.tenantId = this.tenantContext.getTenantId();
      entity.branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(entity);
    return StaffAttendanceRecordMapper.toDomain(saved);
  }

  async findAll(): Promise<StaffAttendanceRecord[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(StaffAttendanceRecordMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<StaffAttendanceRecord>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? StaffAttendanceRecordMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    data: DeepPartial<StaffAttendanceRecord>,
  ): Promise<StaffAttendanceRecord | null> {
    await this.repo.update(id, data as any);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }

  async findByStaffAndDate(
    staffId: number,
    date: string,
  ): Promise<NullableType<StaffAttendanceRecord>> {
    const entity = await this.repo.findOne({
      where: {
        staffId,
        date,
        ...this.getTenantFilter(),
      } as FindOptionsWhere<StaffAttendanceRecordEntity>,
    });
    return entity ? StaffAttendanceRecordMapper.toDomain(entity) : null;
  }

  async findByFilters(filters: {
    staffId?: number;
    branchId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<StaffAttendanceRecord[]> {
    const where: FindOptionsWhere<StaffAttendanceRecordEntity> = {
      ...this.getTenantFilter(),
    } as FindOptionsWhere<StaffAttendanceRecordEntity>;

    if (filters.staffId) {
      where.staffId = filters.staffId;
    }

    if (filters.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters.startDate && filters.endDate) {
      where.date = Between(filters.startDate, filters.endDate);
    } else if (filters.startDate) {
      where.date = MoreThanOrEqual(filters.startDate);
    } else if (filters.endDate) {
      where.date = LessThanOrEqual(filters.endDate);
    }

    const entities = await this.repo.find({ where });
    return entities.map(StaffAttendanceRecordMapper.toDomain);
  }
}
