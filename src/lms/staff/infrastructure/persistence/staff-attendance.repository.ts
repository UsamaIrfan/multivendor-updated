import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { StaffAttendance } from '../../domain/staff-attendance';

export abstract class StaffAttendanceRepository {
  abstract create(data: DeepPartial<StaffAttendance>): Promise<StaffAttendance>;
  abstract findAll(): Promise<StaffAttendance[]>;
  abstract findById(
    id: StaffAttendance['id'],
  ): Promise<NullableType<StaffAttendance>>;
  abstract update(
    id: StaffAttendance['id'],
    data: DeepPartial<StaffAttendance>,
  ): Promise<StaffAttendance | null>;
  abstract remove(id: StaffAttendance['id']): Promise<void>;
}
