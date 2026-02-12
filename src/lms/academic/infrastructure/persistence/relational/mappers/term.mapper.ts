import { Term } from '../../../../domain/term';
import { TermEntity } from '../entities/term.entity';

export class TermMapper {
  static toDomain(entity: TermEntity): Term {
    const domain = new Term();
    domain.id = entity.id;
    domain.academicYearId = entity.academicYear?.id;
    domain.name = entity.name;
    domain.startDate = entity.startDate;
    domain.endDate = entity.endDate;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Term): TermEntity {
    const entity = new TermEntity();
    if (domain.id) entity.id = domain.id;
    entity.name = domain.name;
    entity.startDate = domain.startDate;
    entity.endDate = domain.endDate;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
