import { Permission } from '../../../../domain/permission';
import { PermissionEntity } from '../entities/permission.entity';

export class PermissionMapper {
  static toDomain(entity: PermissionEntity): Permission {
    const domain = new Permission();
    domain.id = entity.id;
    domain.code = entity.code;
    domain.domain = entity.domain;
    domain.description = entity.description;
    domain.createdAt = entity.createdAt;
    return domain;
  }

  static toPersistence(domain: Permission): PermissionEntity {
    const entity = new PermissionEntity();
    if (domain.id) entity.id = domain.id;
    entity.code = domain.code;
    entity.domain = domain.domain;
    entity.description = domain.description;
    return entity;
  }
}
