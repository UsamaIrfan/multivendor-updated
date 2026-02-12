import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { Exam } from '../../domain/exam';

export abstract class ExamRepository {
  abstract create(data: DeepPartial<Exam>): Promise<Exam>;
  abstract findAll(): Promise<Exam[]>;
  abstract findById(id: number): Promise<NullableType<Exam>>;
  abstract update(id: number, payload: DeepPartial<Exam>): Promise<Exam | null>;
  abstract remove(id: number): Promise<void>;
}
