import { Notice } from '../../../../domain/notice';
import { NoticeEntity } from '../entities/notice.entity';

export class NoticeMapper {
  static toDomain(entity: NoticeEntity): Notice {
    const domain = new Notice();
    domain.id = entity.id;
    domain.institutionId = entity.institution?.id ?? 0;
    domain.publishedById = entity.publishedBy?.id ?? null;
    domain.title = entity.title;
    domain.content = entity.content;
    domain.targetAudience = entity.targetAudience;
    domain.isPublished = entity.isPublished;
    domain.publishDate = entity.publishDate;
    domain.expiryDate = entity.expiryDate;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Notice): NoticeEntity {
    const entity = new NoticeEntity();
    if (domain.id) entity.id = domain.id;
    entity.institution = { id: domain.institutionId } as any;
    entity.publishedBy = domain.publishedById
      ? ({ id: domain.publishedById } as any)
      : null;
    entity.title = domain.title;
    entity.content = domain.content;
    entity.targetAudience = domain.targetAudience;
    entity.isPublished = domain.isPublished;
    entity.publishDate = domain.publishDate;
    entity.expiryDate = domain.expiryDate;
    return entity;
  }
}
