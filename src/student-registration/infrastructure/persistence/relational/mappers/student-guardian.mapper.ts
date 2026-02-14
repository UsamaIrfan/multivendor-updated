import { StudentGuardian } from '../../../../domain/student-guardian';
import { StudentGuardianEntity } from '../entities/student-guardian.entity';

export class StudentGuardianMapper {
  static toDomain(entity: StudentGuardianEntity): StudentGuardian {
    const domain = new StudentGuardian();
    domain.id = entity.id;
    domain.studentId = entity.student?.id;
    domain.name = entity.name;
    domain.phone = entity.phone;
    domain.email = entity.email;
    domain.relation = entity.relation;
    domain.isPrimary = entity.isPrimary;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: StudentGuardian): StudentGuardianEntity {
    const entity = new StudentGuardianEntity();
    if (domain.id) entity.id = domain.id;
    entity.name = domain.name;
    entity.phone = domain.phone;
    entity.email = domain.email;
    entity.relation = domain.relation;
    entity.isPrimary = domain.isPrimary;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
