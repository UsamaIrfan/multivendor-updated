import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { Exam } from '../../domain/exam';
import { ExamStatusEnum } from '../../../common/enums/exam-status.enum';

export abstract class ExamRepository {
  abstract create(data: DeepPartial<Exam>): Promise<Exam>;
  abstract findAll(): Promise<Exam[]>;
  abstract findById(id: number): Promise<NullableType<Exam>>;
  abstract update(id: number, payload: DeepPartial<Exam>): Promise<Exam | null>;
  abstract remove(id: number): Promise<void>;
  abstract findByTermId(termId: number): Promise<Exam[]>;
  abstract findByStatus(status: ExamStatusEnum): Promise<Exam[]>;
}
