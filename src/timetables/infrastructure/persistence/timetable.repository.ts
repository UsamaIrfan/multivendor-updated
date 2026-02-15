import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { Timetable } from '../../domain/timetable';

export abstract class TimetableRepository {
  abstract create(data: DeepPartial<Timetable>): Promise<Timetable>;
  abstract findAll(): Promise<Timetable[]>;
  abstract findById(id: string): Promise<NullableType<Timetable>>;
  abstract findByBranch(branchId: string): Promise<Timetable[]>;
  abstract update(
    id: string,
    data: DeepPartial<Timetable>,
  ): Promise<Timetable | null>;
  abstract remove(id: string): Promise<void>;
}
