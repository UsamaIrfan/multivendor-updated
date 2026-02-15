import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { StaffLeaveBalanceEntity } from '../entities/staff-leave-balance.entity';
import { StaffLeaveBalance } from '../../../../domain/staff-leave-balance';
import { StaffLeaveBalanceRepository } from '../../staff-leave-balance.repository';
import { StaffLeaveBalanceMapper } from '../mappers/staff-leave-balance.mapper';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';
import { LeaveTypeEnum } from '../../../../../lms/common/enums/leave-status.enum';

@Injectable()
export class StaffLeaveBalanceRelationalRepository
  implements StaffLeaveBalanceRepository
{
  constructor(
    @InjectRepository(StaffLeaveBalanceEntity)
    private readonly repo: Repository<StaffLeaveBalanceEntity>,
    private readonly tenantContext: TenantContextService,
  ) {}

  private getTenantFilter(): Record<string, unknown> {
    if (this.tenantContext.hasContext()) {
      const filter: Record<string, unknown> = {
        tenantId: this.tenantContext.getTenantId(),
      };
      return filter;
    }
    return {};
  }

  async create(
    data: DeepPartial<StaffLeaveBalance>,
  ): Promise<StaffLeaveBalance> {
    const entity = this.repo.create(
      StaffLeaveBalanceMapper.toPersistence(data as StaffLeaveBalance),
    );
    if (this.tenantContext.hasContext()) {
      entity.tenantId = this.tenantContext.getTenantId();
      entity.branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(entity);
    return StaffLeaveBalanceMapper.toDomain(saved);
  }

  async findAll(): Promise<StaffLeaveBalance[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(StaffLeaveBalanceMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<StaffLeaveBalance>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? StaffLeaveBalanceMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    data: DeepPartial<StaffLeaveBalance>,
  ): Promise<StaffLeaveBalance | null> {
    await this.repo.update(id, data as any);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }

  async findByStaffAndType(
    staffId: number,
    leaveType: LeaveTypeEnum,
    year: number,
  ): Promise<NullableType<StaffLeaveBalance>> {
    const entity = await this.repo.findOne({
      where: {
        staffId,
        leaveType,
        year,
        ...this.getTenantFilter(),
      } as FindOptionsWhere<StaffLeaveBalanceEntity>,
    });
    return entity ? StaffLeaveBalanceMapper.toDomain(entity) : null;
  }

  async findByStaff(
    staffId: number,
    year?: number,
  ): Promise<StaffLeaveBalance[]> {
    const where: FindOptionsWhere<StaffLeaveBalanceEntity> = {
      staffId,
      ...this.getTenantFilter(),
    } as FindOptionsWhere<StaffLeaveBalanceEntity>;
    if (year) {
      where.year = year;
    }
    const entities = await this.repo.find({ where });
    return entities.map(StaffLeaveBalanceMapper.toDomain);
  }

  async findByFilters(filters: {
    staffId?: number;
    leaveType?: LeaveTypeEnum;
    year?: number;
  }): Promise<StaffLeaveBalance[]> {
    const where: FindOptionsWhere<StaffLeaveBalanceEntity> = {
      ...this.getTenantFilter(),
    } as FindOptionsWhere<StaffLeaveBalanceEntity>;

    if (filters.staffId) {
      where.staffId = filters.staffId;
    }
    if (filters.leaveType) {
      where.leaveType = filters.leaveType;
    }
    if (filters.year) {
      where.year = filters.year;
    }

    const entities = await this.repo.find({ where });
    return entities.map(StaffLeaveBalanceMapper.toDomain);
  }
}
