import { CourseMaterial } from '../../../../domain/course-material';
import { MaterialEntity } from '../entities/material.entity';

export class MaterialMapper {
  static toDomain(entity: MaterialEntity): CourseMaterial {
    const domain = new CourseMaterial();
    domain.id = entity.id;
    domain.subjectId = entity.subjectId;
    domain.uploadedById = entity.uploadedById;
    domain.title = entity.title;
    domain.description = entity.description;
    domain.type = entity.type;
    domain.filePath = entity.filePath;
    domain.fileSize = Number(entity.fileSize);
    domain.externalUrl = entity.externalUrl;
    domain.version = entity.version;
    domain.downloadCount = entity.downloadCount;
    domain.isActive = entity.isActive;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: CourseMaterial): MaterialEntity {
    const entity = new MaterialEntity();
    if (domain.id) entity.id = domain.id;
    entity.subjectId = domain.subjectId;
    entity.uploadedById = domain.uploadedById;
    entity.title = domain.title;
    entity.description = domain.description;
    entity.type = domain.type;
    entity.filePath = domain.filePath;
    entity.fileSize = domain.fileSize;
    entity.externalUrl = domain.externalUrl;
    entity.version = domain.version;
    entity.downloadCount = domain.downloadCount;
    entity.isActive = domain.isActive;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
