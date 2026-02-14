import { DownloadRecord } from '../../../../domain/download-record';
import { DownloadRecordEntity } from '../entities/download-record.entity';

export class DownloadRecordMapper {
  static toDomain(entity: DownloadRecordEntity): DownloadRecord {
    const domain = new DownloadRecord();
    domain.id = entity.id;
    domain.tenantId = entity.tenantId;
    domain.materialId = entity.materialId;
    domain.userId = entity.userId;
    domain.downloadedAt = entity.downloadedAt;
    return domain;
  }

  static toPersistence(domain: DownloadRecord): DownloadRecordEntity {
    const entity = new DownloadRecordEntity();
    if (domain.id) entity.id = domain.id;
    entity.tenantId = domain.tenantId;
    entity.materialId = domain.materialId;
    entity.userId = domain.userId;
    entity.downloadedAt = domain.downloadedAt;
    return entity;
  }
}
