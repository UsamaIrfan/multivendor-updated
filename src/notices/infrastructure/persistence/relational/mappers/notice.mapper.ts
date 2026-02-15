import { Notice } from '../../../../domain/notice';
import { NoticeEntity } from '../entities/notice.entity';

export class NoticeMapper {
  static toDomain(entity: NoticeEntity): Notice {
    const domain = new Notice();
    domain.id = entity.id;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.targetBranches = entity.targetBranches?.filter(Boolean) ?? [];
    domain.targetRoles = entity.targetRoles?.filter(Boolean) ?? [];
    domain.title = entity.title;
    domain.content = entity.content;
    domain.attachments = entity.attachments?.filter(Boolean) ?? null;
    domain.isPublished = entity.isPublished;
    domain.publishDate = entity.publishDate;
    domain.expiresAt = entity.expiresAt;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Notice): NoticeEntity {
    const entity = new NoticeEntity();
    if (domain.id) entity.id = domain.id;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.targetBranches = domain.targetBranches ?? [];
    entity.targetRoles = domain.targetRoles ?? [];
    entity.title = domain.title;
    entity.content = domain.content;
    entity.attachments = domain.attachments;
    entity.isPublished = domain.isPublished;
    entity.publishDate = domain.publishDate;
    entity.expiresAt = domain.expiresAt;
    return entity;
  }
}
