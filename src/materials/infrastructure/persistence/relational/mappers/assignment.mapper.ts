import { Assignment } from '../../../../domain/assignment';
import { AssignmentEntity } from '../entities/assignment.entity';

export class AssignmentMapper {
  static toDomain(entity: AssignmentEntity): Assignment {
    const domain = new Assignment();
    domain.id = entity.id;
    domain.subjectId = entity.subjectId;
    domain.title = entity.title;
    domain.description = entity.description;
    domain.dueDate = entity.dueDate;
    domain.totalMarks = entity.totalMarks;
    domain.isActive = entity.isActive;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Assignment): AssignmentEntity {
    const entity = new AssignmentEntity();
    if (domain.id) entity.id = domain.id;
    entity.subjectId = domain.subjectId;
    entity.title = domain.title;
    entity.description = domain.description;
    entity.dueDate = domain.dueDate;
    entity.totalMarks = domain.totalMarks;
    entity.isActive = domain.isActive;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
