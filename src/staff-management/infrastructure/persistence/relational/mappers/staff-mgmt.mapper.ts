import { StaffMgmt } from '../../../../domain/staff-mgmt';
import { StaffMgmtEntity } from '../entities/staff-mgmt.entity';
import { StaffBranchAssignmentMapper } from './staff-branch-assignment.mapper';

export class StaffMgmtMapper {
  static toDomain(entity: StaffMgmtEntity): StaffMgmt {
    const domain = new StaffMgmt();
    domain.id = entity.id;
    domain.userId = entity.user?.id;
    domain.institutionId = entity.institution?.id ?? 0;
    domain.departmentId = entity.department?.id ?? null;
    domain.staffId = entity.staffId;
    domain.primaryBranchId = entity.primaryBranchId;
    domain.designation = entity.designation;
    domain.qualification = entity.qualification;
    domain.specialization = entity.specialization;
    domain.experienceYears = entity.experienceYears;
    domain.joiningDate = entity.joiningDate;
    domain.basicSalary = entity.basicSalary;
    domain.employmentType = entity.employmentType;
    domain.emergencyContact = entity.emergencyContact;
    domain.address = entity.address;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;

    if (entity.branchAssignments) {
      domain.branchAssignments = entity.branchAssignments.map(
        StaffBranchAssignmentMapper.toDomain,
      );
    }

    return domain;
  }

  static toPersistence(domain: StaffMgmt): StaffMgmtEntity {
    const entity = new StaffMgmtEntity();
    if (domain.id) entity.id = domain.id;
    entity.user = { id: domain.userId } as any;
    entity.institution = { id: domain.institutionId } as any;
    entity.department = domain.departmentId
      ? ({ id: domain.departmentId } as any)
      : null;
    entity.staffId = domain.staffId;
    entity.primaryBranchId = domain.primaryBranchId;
    entity.designation = domain.designation;
    entity.qualification = domain.qualification;
    entity.specialization = domain.specialization;
    entity.experienceYears = domain.experienceYears;
    entity.joiningDate = domain.joiningDate;
    entity.basicSalary = domain.basicSalary;
    entity.employmentType = domain.employmentType;
    entity.emergencyContact = domain.emergencyContact;
    entity.address = domain.address;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    return entity;
  }
}
