import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { TimetableSlot } from '../../domain/timetable-slot';

export abstract class TimetableSlotRepository {
  abstract create(data: DeepPartial<TimetableSlot>): Promise<TimetableSlot>;
  abstract findAll(): Promise<TimetableSlot[]>;
  abstract findById(
    id: TimetableSlot['id'],
  ): Promise<NullableType<TimetableSlot>>;
  abstract update(
    id: TimetableSlot['id'],
    data: DeepPartial<TimetableSlot>,
  ): Promise<TimetableSlot | null>;
  abstract remove(id: TimetableSlot['id']): Promise<void>;
}
