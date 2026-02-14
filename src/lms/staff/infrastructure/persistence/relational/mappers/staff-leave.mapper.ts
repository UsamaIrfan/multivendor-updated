import { StaffLeave } from '../../../../domain/staff-leave';
import { StaffLeaveEntity } from '../entities/staff-leave.entity';
import { UserEntity } from '../../../../../../users/infrastructure/persistence/relational/entities/user.entity';

export class StaffLeaveMapper {
  static toDomain(entity: StaffLeaveEntity): StaffLeave {
    const domain = new StaffLeave();
    domain.id = entity.id;
    domain.staffId = entity.staff?.id ?? 0;
    domain.fromDate = entity.fromDate;
    domain.toDate = entity.toDate;
    domain.leaveType = entity.leaveType;
    domain.reason = entity.reason;
    domain.status = entity.status;
    domain.approvedById = entity.approvedBy?.id ?? null;
    domain.adminRemarks = entity.adminRemarks;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: StaffLeave): StaffLeaveEntity {
    const entity = new StaffLeaveEntity();
    if (domain.id) entity.id = domain.id;
    entity.staff = { id: domain.staffId } as any;
    entity.fromDate = domain.fromDate;
    entity.toDate = domain.toDate;
    entity.leaveType = domain.leaveType;
    entity.reason = domain.reason;
    entity.status = domain.status;
    entity.approvedBy = domain.approvedById
      ? ({ id: domain.approvedById } as UserEntity)
      : null;
    entity.adminRemarks = domain.adminRemarks;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    return entity;
  }
}
