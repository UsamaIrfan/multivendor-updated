import { TimetableSlot } from '../../../../domain/timetable-slot';
import { TimetableSlotEntity } from '../entities/timetable-slot.entity';

export class TimetableSlotMapper {
  static toDomain(entity: TimetableSlotEntity): TimetableSlot {
    const domain = new TimetableSlot();
    domain.id = entity.id;
    domain.sectionId = entity.section?.id ?? 0;
    domain.subjectId = entity.subject?.id ?? 0;
    domain.staffId = entity.staff?.id ?? null;
    domain.dayOfWeek = entity.dayOfWeek;
    domain.startTime = entity.startTime;
    domain.endTime = entity.endTime;
    domain.room = entity.room;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: TimetableSlot): TimetableSlotEntity {
    const entity = new TimetableSlotEntity();
    if (domain.id) entity.id = domain.id;
    entity.section = { id: domain.sectionId } as any;
    entity.subject = { id: domain.subjectId } as any;
    entity.staff = domain.staffId ? ({ id: domain.staffId } as any) : null;
    entity.dayOfWeek = domain.dayOfWeek;
    entity.startTime = domain.startTime;
    entity.endTime = domain.endTime;
    entity.room = domain.room;
    return entity;
  }
}
