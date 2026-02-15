import { Period } from '../../../../domain/period';
import { PeriodEntity } from '../entities/period.entity';

export class PeriodMapper {
  static toDomain(entity: PeriodEntity): Period {
    const domain = new Period();
    domain.id = entity.id;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId!;
    domain.timetableId = entity.timetableId;
    domain.subjectId = entity.subjectId;
    domain.teacherId = entity.teacherId;
    domain.dayOfWeek = entity.dayOfWeek;
    domain.startTime = entity.startTime;
    domain.endTime = entity.endTime;
    domain.room = entity.room;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Period): PeriodEntity {
    const entity = new PeriodEntity();
    if (domain.id) entity.id = domain.id;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.timetableId = domain.timetableId;
    entity.subjectId = domain.subjectId;
    entity.teacherId = domain.teacherId;
    entity.dayOfWeek = domain.dayOfWeek;
    entity.startTime = domain.startTime;
    entity.endTime = domain.endTime;
    entity.room = domain.room;
    return entity;
  }
}
