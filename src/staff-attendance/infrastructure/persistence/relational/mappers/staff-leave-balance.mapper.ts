import { StaffLeaveBalanceEntity } from '../entities/staff-leave-balance.entity';
import { StaffLeaveBalance } from '../../../../domain/staff-leave-balance';

export class StaffLeaveBalanceMapper {
  static toDomain(entity: StaffLeaveBalanceEntity): StaffLeaveBalance {
    const domain = new StaffLeaveBalance();
    domain.id = entity.id;
    domain.staffId = entity.staffId;
    domain.leaveType = entity.leaveType;
    domain.totalDays = Number(entity.totalDays);
    domain.usedDays = Number(entity.usedDays);
    domain.year = entity.year;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: StaffLeaveBalance): StaffLeaveBalanceEntity {
    const entity = new StaffLeaveBalanceEntity();
    if (domain.id) entity.id = domain.id;
    entity.staff = { id: domain.staffId } as any;
    entity.staffId = domain.staffId;
    entity.leaveType = domain.leaveType;
    entity.totalDays = domain.totalDays;
    entity.usedDays = domain.usedDays;
    entity.year = domain.year;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    return entity;
  }
}
