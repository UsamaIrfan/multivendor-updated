import { StaffLeaveApplicationEntity } from '../entities/staff-leave-application.entity';
import { StaffLeaveApplication } from '../../../../domain/staff-leave-application';

export class StaffLeaveApplicationMapper {
  static toDomain(entity: StaffLeaveApplicationEntity): StaffLeaveApplication {
    const domain = new StaffLeaveApplication();
    domain.id = entity.id;
    domain.staffId = entity.staffId;
    domain.fromDate = entity.fromDate;
    domain.toDate = entity.toDate;
    domain.leaveType = entity.leaveType;
    domain.reason = entity.reason;
    domain.status = entity.status;
    domain.approvedById = entity.approvedById;
    domain.adminRemarks = entity.adminRemarks;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(
    domain: StaffLeaveApplication,
  ): StaffLeaveApplicationEntity {
    const entity = new StaffLeaveApplicationEntity();
    if (domain.id) entity.id = domain.id;
    entity.staff = { id: domain.staffId } as any;
    entity.staffId = domain.staffId;
    entity.fromDate = domain.fromDate;
    entity.toDate = domain.toDate;
    entity.leaveType = domain.leaveType;
    entity.reason = domain.reason;
    entity.status = domain.status;
    entity.approvedById = domain.approvedById;
    entity.adminRemarks = domain.adminRemarks;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    return entity;
  }
}
