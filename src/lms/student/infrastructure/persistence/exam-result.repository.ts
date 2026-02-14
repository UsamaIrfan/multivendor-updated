import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { ExamResult } from '../../domain/exam-result';

export abstract class ExamResultRepository {
  abstract create(data: DeepPartial<ExamResult>): Promise<ExamResult>;
  abstract findAll(): Promise<ExamResult[]>;
  abstract findById(id: number): Promise<NullableType<ExamResult>>;
  abstract update(
    id: number,
    payload: DeepPartial<ExamResult>,
  ): Promise<ExamResult | null>;
  abstract remove(id: number): Promise<void>;
  abstract findByExamSubjectId(examSubjectId: number): Promise<ExamResult[]>;
  abstract findByStudentId(studentId: number): Promise<ExamResult[]>;
  abstract findByExamSubjectIdAndStudentId(
    examSubjectId: number,
    studentId: number,
  ): Promise<NullableType<ExamResult>>;
  abstract bulkCreate(data: DeepPartial<ExamResult>[]): Promise<ExamResult[]>;
}
