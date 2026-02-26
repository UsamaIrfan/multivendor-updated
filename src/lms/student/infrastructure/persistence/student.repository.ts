import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { Student } from '../../domain/student';

export abstract class StudentRepository {
  abstract create(data: DeepPartial<Student>): Promise<Student>;
  abstract findAll(): Promise<Student[]>;
  abstract findById(id: number): Promise<NullableType<Student>>;
  abstract findByUserId(userId: number): Promise<NullableType<Student>>;
  abstract update(
    id: number,
    payload: DeepPartial<Student>,
  ): Promise<Student | null>;
  abstract remove(id: number): Promise<void>;
}
