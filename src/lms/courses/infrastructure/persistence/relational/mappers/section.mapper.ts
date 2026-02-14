import { Section } from '../../../../domain/section';
import { SectionEntity } from '../entities/section.entity';
import { GradeClassEntity } from '../entities/grade-class.entity';

export class SectionMapper {
  static toDomain(entity: SectionEntity): Section {
    const domain = new Section();
    domain.id = entity.id;
    domain.gradeClassId = entity.gradeClass?.id;
    domain.classTeacherId = entity.classTeacherId;
    domain.name = entity.name;
    domain.capacity = entity.capacity;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Section): SectionEntity {
    const entity = new SectionEntity();
    if (domain.id) entity.id = domain.id;

    if (domain.gradeClassId) {
      const gradeClass = new GradeClassEntity();
      gradeClass.id = domain.gradeClassId;
      entity.gradeClass = gradeClass;
    }

    entity.classTeacherId = domain.classTeacherId;
    entity.name = domain.name;
    entity.capacity = domain.capacity;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
