import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { Period } from '../../domain/period';

export interface ConflictCheckOptions {
  tenantId: string;
  teacherId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  excludePeriodId?: string;
}

export abstract class PeriodRepository {
  abstract create(data: DeepPartial<Period>): Promise<Period>;
  abstract findAll(): Promise<Period[]>;
  abstract findById(id: string): Promise<NullableType<Period>>;
  abstract findByTimetable(timetableId: string): Promise<Period[]>;
  abstract findConflicts(options: ConflictCheckOptions): Promise<Period[]>;
  abstract findRoomConflicts(
    tenantId: string,
    branchId: string,
    room: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludePeriodId?: string,
  ): Promise<Period[]>;
  abstract update(
    id: string,
    data: DeepPartial<Period>,
  ): Promise<Period | null>;
  abstract remove(id: string): Promise<void>;
}
