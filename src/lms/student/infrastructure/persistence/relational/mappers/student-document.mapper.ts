import { StudentDocument } from '../../../../domain/student-document';
import { StudentDocumentEntity } from '../entities/student-document.entity';
import { StudentEntity } from '../entities/student.entity';
import { FileEntity } from '../../../../../../files/infrastructure/persistence/relational/entities/file.entity';

export class StudentDocumentMapper {
  static toDomain(entity: StudentDocumentEntity): StudentDocument {
    const domain = new StudentDocument();
    domain.id = entity.id;
    domain.studentId = entity.student?.id;
    domain.documentType = entity.documentType;
    domain.fileId = entity.file?.id ?? null;
    domain.isVerified = entity.isVerified;
    domain.remarks = entity.remarks;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: StudentDocument): StudentDocumentEntity {
    const entity = new StudentDocumentEntity();
    if (domain.id) entity.id = domain.id;

    if (domain.studentId) {
      const student = new StudentEntity();
      student.id = domain.studentId;
      entity.student = student;
    }

    if (domain.fileId) {
      const file = new FileEntity();
      file.id = domain.fileId;
      entity.file = file;
    } else {
      entity.file = null;
    }

    entity.documentType = domain.documentType;
    entity.isVerified = domain.isVerified;
    entity.remarks = domain.remarks;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
