import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { StudentEnrollment } from '../../domain/student-enrollment';

export abstract class StudentEnrollmentRepository {
  abstract create(
    data: DeepPartial<StudentEnrollment>,
  ): Promise<StudentEnrollment>;
  abstract findAll(): Promise<StudentEnrollment[]>;
  abstract findById(id: number): Promise<NullableType<StudentEnrollment>>;
  abstract update(
    id: number,
    payload: DeepPartial<StudentEnrollment>,
  ): Promise<StudentEnrollment | null>;
  abstract remove(id: number): Promise<void>;
}
