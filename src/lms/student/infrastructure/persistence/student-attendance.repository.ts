import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { StudentAttendance } from '../../domain/student-attendance';

export abstract class StudentAttendanceRepository {
  abstract create(data: DeepPartial<StudentAttendance>): Promise<StudentAttendance>;
  abstract findAll(): Promise<StudentAttendance[]>;
  abstract findById(id: number): Promise<NullableType<StudentAttendance>>;
  abstract update(
    id: number,
    payload: DeepPartial<StudentAttendance>,
  ): Promise<StudentAttendance | null>;
  abstract remove(id: number): Promise<void>;
}
