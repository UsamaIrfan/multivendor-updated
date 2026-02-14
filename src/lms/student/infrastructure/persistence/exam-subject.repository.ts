import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { ExamSubject } from '../../domain/exam-subject';

export abstract class ExamSubjectRepository {
  abstract create(data: DeepPartial<ExamSubject>): Promise<ExamSubject>;
  abstract findAll(): Promise<ExamSubject[]>;
  abstract findById(id: number): Promise<NullableType<ExamSubject>>;
  abstract update(
    id: number,
    payload: DeepPartial<ExamSubject>,
  ): Promise<ExamSubject | null>;
  abstract remove(id: number): Promise<void>;
  abstract findByExamId(examId: number): Promise<ExamSubject[]>;
}
