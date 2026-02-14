import { LeaveRequest } from '../../../../domain/leave-request';
import { LeaveRequestEntity } from '../entities/leave-request.entity';
import { StudentEntity } from '../entities/student.entity';
import { UserEntity } from '../../../../../../users/infrastructure/persistence/relational/entities/user.entity';

export class LeaveRequestMapper {
  static toDomain(entity: LeaveRequestEntity): LeaveRequest {
    const domain = new LeaveRequest();
    domain.id = entity.id;
    domain.studentId = entity.student?.id;
    domain.fromDate = entity.fromDate;
    domain.toDate = entity.toDate;
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

  static toPersistence(domain: LeaveRequest): LeaveRequestEntity {
    const entity = new LeaveRequestEntity();
    if (domain.id) entity.id = domain.id;

    if (domain.studentId) {
      const student = new StudentEntity();
      student.id = domain.studentId;
      entity.student = student;
    }

    if (domain.approvedById) {
      const approvedBy = new UserEntity();
      approvedBy.id = domain.approvedById;
      entity.approvedBy = approvedBy;
    } else {
      entity.approvedBy = null;
    }

    entity.fromDate = domain.fromDate;
    entity.toDate = domain.toDate;
    entity.reason = domain.reason;
    entity.status = domain.status;
    entity.adminRemarks = domain.adminRemarks;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
