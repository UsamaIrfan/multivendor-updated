import { CourseMaterial } from '../../../../domain/course-material';
import { CourseMaterialEntity } from '../entities/course-material.entity';
import { SubjectEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/subject.entity';
import { FileEntity } from '../../../../../../files/infrastructure/persistence/relational/entities/file.entity';

export class CourseMaterialMapper {
  static toDomain(entity: CourseMaterialEntity): CourseMaterial {
    const domain = new CourseMaterial();
    domain.id = entity.id;
    domain.subjectId = entity.subject?.id;
    domain.uploadedById = entity.uploadedById;
    domain.title = entity.title;
    domain.description = entity.description;
    domain.type = entity.type;
    domain.fileId = entity.file?.id ?? null;
    domain.externalUrl = entity.externalUrl;
    domain.isActive = entity.isActive;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: CourseMaterial): CourseMaterialEntity {
    const entity = new CourseMaterialEntity();
    if (domain.id) entity.id = domain.id;

    if (domain.subjectId) {
      const subject = new SubjectEntity();
      subject.id = domain.subjectId;
      entity.subject = subject;
    }

    if (domain.fileId) {
      const file = new FileEntity();
      file.id = domain.fileId;
      entity.file = file;
    } else {
      entity.file = null;
    }

    entity.uploadedById = domain.uploadedById;
    entity.title = domain.title;
    entity.description = domain.description;
    entity.type = domain.type;
    entity.externalUrl = domain.externalUrl;
    entity.isActive = domain.isActive;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
