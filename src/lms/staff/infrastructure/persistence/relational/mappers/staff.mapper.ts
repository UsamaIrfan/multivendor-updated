import { Staff } from '../../../../domain/staff';
import { StaffEntity } from '../entities/staff.entity';

export class StaffMapper {
  static toDomain(entity: StaffEntity): Staff {
    const domain = new Staff();
    domain.id = entity.id;
    domain.userId = entity.user?.id;
    domain.institutionId = entity.institution?.id ?? 0;
    domain.departmentId = entity.department?.id ?? null;
    domain.employeeId = entity.employeeId;
    domain.designation = entity.designation;
    domain.qualification = entity.qualification;
    domain.specialization = entity.specialization;
    domain.experienceYears = entity.experienceYears;
    domain.joiningDate = entity.joiningDate;
    domain.basicSalary = entity.basicSalary;
    domain.employmentType = entity.employmentType;
    domain.emergencyContact = entity.emergencyContact;
    domain.address = entity.address;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Staff): StaffEntity {
    const entity = new StaffEntity();
    if (domain.id) entity.id = domain.id;
    entity.user = { id: domain.userId } as any;
    entity.institution = { id: domain.institutionId } as any;
    entity.department = domain.departmentId
      ? ({ id: domain.departmentId } as any)
      : null;
    entity.employeeId = domain.employeeId;
    entity.designation = domain.designation;
    entity.qualification = domain.qualification;
    entity.specialization = domain.specialization;
    entity.experienceYears = domain.experienceYears;
    entity.joiningDate = domain.joiningDate;
    entity.basicSalary = domain.basicSalary;
    entity.employmentType = domain.employmentType;
    entity.emergencyContact = domain.emergencyContact;
    entity.address = domain.address;
    return entity;
  }
}
