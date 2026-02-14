import { Exam } from '../../../../domain/exam';
import { ExamEntity } from '../entities/exam.entity';
import { TermEntity } from '../../../../../academic/infrastructure/persistence/relational/entities/term.entity';

export class ExamMapper {
  static toDomain(entity: ExamEntity): Exam {
    const domain = new Exam();
    domain.id = entity.id;
    domain.termId = entity.term?.id;
    domain.name = entity.name;
    domain.type = entity.type;
    domain.status = entity.status;
    domain.startDate = entity.startDate;
    domain.endDate = entity.endDate;
    domain.description = entity.description;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Exam): ExamEntity {
    const entity = new ExamEntity();
    if (domain.id) entity.id = domain.id;

    if (domain.termId) {
      const term = new TermEntity();
      term.id = domain.termId;
      entity.term = term;
    }

    entity.name = domain.name;
    entity.type = domain.type;
    if (domain.status) entity.status = domain.status;
    entity.startDate = domain.startDate;
    entity.endDate = domain.endDate;
    entity.description = domain.description;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
