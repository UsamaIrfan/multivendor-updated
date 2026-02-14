import { ExamResult } from '../../../../domain/exam-result';
import { ExamResultEntity } from '../entities/exam-result.entity';
import { ExamSubjectEntity } from '../entities/exam-subject.entity';
import { StudentEntity } from '../entities/student.entity';

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
    domain.percentage = entity.percentage;
    domain.rank = entity.rank;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: ExamResult): ExamResultEntity {
    const entity = new ExamResultEntity();
    if (domain.id) entity.id = domain.id;

    if (domain.examSubjectId) {
      const examSubject = new ExamSubjectEntity();
      examSubject.id = domain.examSubjectId;
      entity.examSubject = examSubject;
    }

    if (domain.studentId) {
      const student = new StudentEntity();
      student.id = domain.studentId;
      entity.student = student;
    }

    entity.marksObtained = domain.marksObtained;
    entity.grade = domain.grade;
    entity.isAbsent = domain.isAbsent;
    entity.remarks = domain.remarks;
    entity.percentage = domain.percentage ?? null;
    entity.rank = domain.rank ?? null;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
