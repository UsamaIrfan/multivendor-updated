import { StaffBranchAssignment } from '../../../../domain/staff-branch-assignment';
import { StaffBranchAssignmentEntity } from '../entities/staff-branch-assignment.entity';

export class StaffBranchAssignmentMapper {
  static toDomain(entity: StaffBranchAssignmentEntity): StaffBranchAssignment {
    const domain = new StaffBranchAssignment();
    domain.id = entity.id;
    domain.tenantId = entity.tenantId;
    domain.staffEntityId = entity.staffEntityId;
    domain.branchId = entity.branchId;
    domain.roles = entity.roles;
    domain.isPrimary = entity.isPrimary;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    return domain;
  }

  static toPersistence(
    domain: StaffBranchAssignment,
  ): StaffBranchAssignmentEntity {
    const entity = new StaffBranchAssignmentEntity();
    if (domain.id) entity.id = domain.id;
    entity.tenantId = domain.tenantId;
    entity.staffEntityId = domain.staffEntityId;
    entity.branchId = domain.branchId;
    entity.roles = domain.roles;
    entity.isPrimary = domain.isPrimary;
    return entity;
  }
}
