import { GradeClass } from '../../../../domain/grade-class';
import { GradeClassEntity } from '../entities/grade-class.entity';
import { InstitutionEntity } from '../entities/institution.entity';

export class GradeClassMapper {
  static toDomain(entity: GradeClassEntity): GradeClass {
    const domain = new GradeClass();
    domain.id = entity.id;
    domain.institutionId = entity.institution?.id;
    domain.name = entity.name;
    domain.numericGrade = entity.numericGrade;
    domain.description = entity.description;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: GradeClass): GradeClassEntity {
    const entity = new GradeClassEntity();
    if (domain.id) entity.id = domain.id;

    if (domain.institutionId) {
      const institution = new InstitutionEntity();
      institution.id = domain.institutionId;
      entity.institution = institution;
    }

    entity.name = domain.name;
    entity.numericGrade = domain.numericGrade;
    entity.description = domain.description;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
