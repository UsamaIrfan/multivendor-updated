import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { StudentEnrollment } from '../../domain/student-enrollment';

export interface EnrollmentFilter {
  sectionId?: number;
  status?: string;
}

export abstract class StudentEnrollmentRepository {
  abstract create(
    data: DeepPartial<StudentEnrollment>,
  ): Promise<StudentEnrollment>;
  abstract findAll(filter?: EnrollmentFilter): Promise<StudentEnrollment[]>;
  abstract findById(id: number): Promise<NullableType<StudentEnrollment>>;
  abstract findByStudentAndYear(
    studentId: number,
    academicYearId: number,
  ): Promise<NullableType<StudentEnrollment>>;
  abstract update(
    id: number,
    payload: DeepPartial<StudentEnrollment>,
  ): Promise<StudentEnrollment | null>;
  abstract remove(id: number): Promise<void>;
}
