import { Timetable } from '../../../../domain/timetable';
import { TimetableEntity } from '../entities/timetable.entity';

export class TimetableMapper {
  static toDomain(entity: TimetableEntity): Timetable {
    const domain = new Timetable();
    domain.id = entity.id;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId!;
    domain.classId = entity.classId;
    domain.academicYearId = entity.academicYearId;
    domain.name = entity.name;
    domain.isActive = entity.isActive;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Timetable): TimetableEntity {
    const entity = new TimetableEntity();
    if (domain.id) entity.id = domain.id;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.classId = domain.classId;
    entity.academicYearId = domain.academicYearId;
    entity.name = domain.name;
    entity.isActive = domain.isActive;
    return entity;
  }
}
