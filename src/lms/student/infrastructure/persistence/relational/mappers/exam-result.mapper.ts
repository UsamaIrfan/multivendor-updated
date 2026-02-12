import { ExamResult } from '../../../../domain/exam-result';
import { ExamResultEntity } from '../entities/exam-result.entity';

export class ExamResultMapper {
  static toDomain(entity: ExamResultEntity): ExamResult {
    const domain = new ExamResult();
    domain.id = entity.id;
    domain.examSubjectId = entity.examSubject?.id;
    domain.studentId = entity.student?.id;
    domain.marksObtained = entity.marksObtained;
    domain.grade = entity.grade;
    domain.isAbsent = entity.isAbsent;
    domain.remarks = entity.remarks;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: ExamResult): ExamResultEntity {
    const entity = new ExamResultEntity();
    if (domain.id) entity.id = domain.id;
    entity.marksObtained = domain.marksObtained;
    entity.grade = domain.grade;
    entity.isAbsent = domain.isAbsent;
    entity.remarks = domain.remarks;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
