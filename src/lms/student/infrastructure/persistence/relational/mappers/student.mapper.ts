import { Student } from '../../../../domain/student';
import { StudentEntity } from '../entities/student.entity';

export class StudentMapper {
  static toDomain(entity: StudentEntity): Student {
    const domain = new Student();
    domain.id = entity.id;
    domain.userId = entity.user?.id;
    domain.institutionId = entity.institution?.id;
    domain.rollNumber = entity.rollNumber;
    domain.dateOfBirth = entity.dateOfBirth;
    domain.gender = entity.gender;
    domain.guardianName = entity.guardianName;
    domain.guardianPhone = entity.guardianPhone;
    domain.guardianEmail = entity.guardianEmail;
    domain.guardianRelation = entity.guardianRelation;
    domain.address = entity.address;
    domain.city = entity.city;
    domain.bloodGroup = entity.bloodGroup;
    domain.nationality = entity.nationality;
    domain.religion = entity.religion;
    domain.admissionDate = entity.admissionDate;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Student): StudentEntity {
    const entity = new StudentEntity();
    if (domain.id) entity.id = domain.id;
    entity.rollNumber = domain.rollNumber;
    entity.dateOfBirth = domain.dateOfBirth;
    entity.gender = domain.gender;
    entity.guardianName = domain.guardianName;
    entity.guardianPhone = domain.guardianPhone;
    entity.guardianEmail = domain.guardianEmail;
    entity.guardianRelation = domain.guardianRelation;
    entity.address = domain.address;
    entity.city = domain.city;
    entity.bloodGroup = domain.bloodGroup;
    entity.nationality = domain.nationality;
    entity.religion = domain.religion;
    entity.admissionDate = domain.admissionDate;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
