import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { StaffLeaveApplicationEntity } from '../entities/staff-leave-application.entity';
import { StaffLeaveApplication } from '../../../../domain/staff-leave-application';
import { StaffLeaveApplicationRepository } from '../../staff-leave-application.repository';
import { StaffLeaveApplicationMapper } from '../mappers/staff-leave-application.mapper';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';
import { LeaveStatusEnum } from '../../../../../lms/common/enums/leave-status.enum';

@Injectable()
export class StaffLeaveApplicationRelationalRepository
  implements StaffLeaveApplicationRepository
{
  constructor(
    @InjectRepository(StaffLeaveApplicationEntity)
    private readonly repo: Repository<StaffLeaveApplicationEntity>,
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
    data: DeepPartial<StaffLeaveApplication>,
  ): Promise<StaffLeaveApplication> {
    const entity = this.repo.create(
      StaffLeaveApplicationMapper.toPersistence(data as StaffLeaveApplication),
    );
    if (this.tenantContext.hasContext()) {
      entity.tenantId = this.tenantContext.getTenantId();
      entity.branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(entity);
    return StaffLeaveApplicationMapper.toDomain(saved);
  }

  async findAll(): Promise<StaffLeaveApplication[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(StaffLeaveApplicationMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<StaffLeaveApplication>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? StaffLeaveApplicationMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    data: DeepPartial<StaffLeaveApplication>,
  ): Promise<StaffLeaveApplication | null> {
    await this.repo.update(id, data as any);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }

  async findByStaffId(staffId: number): Promise<StaffLeaveApplication[]> {
    const entities = await this.repo.find({
      where: {
        staffId,
        ...this.getTenantFilter(),
      } as FindOptionsWhere<StaffLeaveApplicationEntity>,
    });
    return entities.map(StaffLeaveApplicationMapper.toDomain);
  }

  async findOverlapping(
    staffId: number,
    fromDate: Date,
    toDate: Date,
  ): Promise<StaffLeaveApplication[]> {
    const entities = await this.repo.find({
      where: {
        staffId,
        status: LeaveStatusEnum.pending,
        fromDate: LessThanOrEqual(toDate),
        toDate: MoreThanOrEqual(fromDate),
        ...this.getTenantFilter(),
      } as FindOptionsWhere<StaffLeaveApplicationEntity>,
    });
    return entities.map(StaffLeaveApplicationMapper.toDomain);
  }
}
