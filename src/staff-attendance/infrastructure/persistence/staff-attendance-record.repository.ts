import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { StaffAttendanceRecord } from '../../domain/staff-attendance-record';

export abstract class StaffAttendanceRecordRepository {
  abstract create(
    data: DeepPartial<StaffAttendanceRecord>,
  ): Promise<StaffAttendanceRecord>;

  abstract findAll(): Promise<StaffAttendanceRecord[]>;

  abstract findById(id: number): Promise<NullableType<StaffAttendanceRecord>>;

  abstract update(
    id: number,
    data: DeepPartial<StaffAttendanceRecord>,
  ): Promise<StaffAttendanceRecord | null>;

  abstract remove(id: number): Promise<void>;

  abstract findByStaffAndDate(
    staffId: number,
    date: string,
  ): Promise<NullableType<StaffAttendanceRecord>>;

  abstract findByFilters(filters: {
    staffId?: number;
    branchId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<StaffAttendanceRecord[]>;
}
