import { Timetable } from '../../../../domain/timetable';
import { TimetableEntity } from '../entities/timetable.entity';

export class TimetableMapper {
  static toDomain(entity: TimetableEntity): Timetable {
    const domain = new Timetable();
    domain.id = entity.id;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId!;
    domain.classId = entity.gradeClass?.id ?? 0;
    domain.className = entity.gradeClass?.name ?? undefined;
    domain.sectionId = entity.section?.id ?? null;
    domain.sectionName = entity.section?.name ?? null;
    domain.academicYearId = entity.academicYear?.id ?? 0;
    domain.academicYearName = entity.academicYear?.name ?? undefined;
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
    entity.gradeClass = { id: domain.classId } as any;
    entity.section = domain.sectionId
      ? ({ id: domain.sectionId } as any)
      : null;
    entity.academicYear = { id: domain.academicYearId } as any;
    entity.name = domain.name;
    entity.isActive = domain.isActive;
    return entity;
  }
}
