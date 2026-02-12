import { GradeClass } from '../../../../domain/grade-class';
import { GradeClassEntity } from '../entities/grade-class.entity';

export class GradeClassMapper {
  static toDomain(entity: GradeClassEntity): GradeClass {
    const domain = new GradeClass();
    domain.id = entity.id;
    domain.institutionId = entity.institution?.id;
    domain.name = entity.name;
    domain.numericGrade = entity.numericGrade;
    domain.description = entity.description;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: GradeClass): GradeClassEntity {
    const entity = new GradeClassEntity();
    if (domain.id) entity.id = domain.id;
    entity.name = domain.name;
    entity.numericGrade = domain.numericGrade;
    entity.description = domain.description;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
