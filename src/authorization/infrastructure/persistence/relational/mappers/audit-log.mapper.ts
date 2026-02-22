import { AuditLog } from '../../../../domain/audit-log';
import { AuditLogEntity } from '../entities/audit-log.entity';

export class AuditLogMapper {
  static toDomain(entity: AuditLogEntity): AuditLog {
    const domain = new AuditLog();
    domain.id = entity.id;
    domain.tenantId = entity.tenantId;
    domain.userId = entity.userId;
    domain.action = entity.action;
    domain.resourceType = entity.resourceType;
    domain.resourceId = entity.resourceId;
    domain.details = entity.details;
    domain.ipAddress = entity.ipAddress;
    domain.createdAt = entity.createdAt;
    return domain;
  }

  static toPersistence(domain: AuditLog): AuditLogEntity {
    const entity = new AuditLogEntity();
    if (domain.id) entity.id = domain.id;
    entity.tenantId = domain.tenantId;
    entity.userId = domain.userId;
    entity.action = domain.action;
    entity.resourceType = domain.resourceType;
    entity.resourceId = domain.resourceId;
    entity.details = domain.details;
    entity.ipAddress = domain.ipAddress;
    return entity;
  }
}
