import { AssignmentSubmission } from '../../../../domain/assignment-submission';
import { AssignmentSubmissionEntity } from '../entities/assignment-submission.entity';

export class AssignmentSubmissionMapper {
  static toDomain(entity: AssignmentSubmissionEntity): AssignmentSubmission {
    const domain = new AssignmentSubmission();
    domain.id = entity.id;
    domain.assignmentId = entity.assignmentId;
    domain.studentId = entity.studentId;
    domain.filePath = entity.filePath;
    domain.fileSize = Number(entity.fileSize);
    domain.remarks = entity.remarks;
    domain.marks = entity.marks;
    domain.submittedAt = entity.submittedAt;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: AssignmentSubmission): AssignmentSubmissionEntity {
    const entity = new AssignmentSubmissionEntity();
    if (domain.id) entity.id = domain.id;
    entity.assignmentId = domain.assignmentId;
    entity.studentId = domain.studentId;
    entity.filePath = domain.filePath;
    entity.fileSize = domain.fileSize;
    entity.remarks = domain.remarks;
    entity.marks = domain.marks;
    entity.submittedAt = domain.submittedAt;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
