import { ExamSubject } from '../../../../domain/exam-subject';
import { ExamSubjectEntity } from '../entities/exam-subject.entity';

export class ExamSubjectMapper {
  static toDomain(entity: ExamSubjectEntity): ExamSubject {
    const domain = new ExamSubject();
    domain.id = entity.id;
    domain.examId = entity.exam?.id;
    domain.subjectId = entity.subject?.id;
    domain.examDate = entity.examDate;
    domain.totalMarks = entity.totalMarks;
    domain.passingMarks = entity.passingMarks;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: ExamSubject): ExamSubjectEntity {
    const entity = new ExamSubjectEntity();
    if (domain.id) entity.id = domain.id;
    entity.examDate = domain.examDate;
    entity.totalMarks = domain.totalMarks;
    entity.passingMarks = domain.passingMarks;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
