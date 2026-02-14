import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { StudentGuardian } from '../../domain/student-guardian';

export abstract class StudentGuardianRepository {
  abstract create(data: DeepPartial<StudentGuardian>): Promise<StudentGuardian>;
  abstract findAll(): Promise<StudentGuardian[]>;
  abstract findById(id: number): Promise<NullableType<StudentGuardian>>;
  abstract update(
    id: number,
    payload: DeepPartial<StudentGuardian>,
  ): Promise<StudentGuardian | null>;
  abstract remove(id: number): Promise<void>;
}
