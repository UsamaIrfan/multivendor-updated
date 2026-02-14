import { Subject } from '../../../../domain/subject';
import { SubjectEntity } from '../entities/subject.entity';

export class SubjectMapper {
  static toDomain(entity: SubjectEntity): Subject {
    const domain = new Subject();
    domain.id = entity.id;
    domain.departmentId = entity.department?.id;
    domain.name = entity.name;
    domain.code = entity.code;
    domain.creditHours = entity.creditHours;
    domain.description = entity.description;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Subject): SubjectEntity {
    const entity = new SubjectEntity();
    if (domain.id) entity.id = domain.id;
    entity.name = domain.name;
    entity.code = domain.code;
    entity.creditHours = domain.creditHours;
    entity.description = domain.description;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
