import { UserPermissionOverride } from '../../../../domain/user-permission-override';
import { UserPermissionOverrideEntity } from '../entities/user-permission-override.entity';

export class UserPermissionOverrideMapper {
  static toDomain(
    entity: UserPermissionOverrideEntity,
  ): UserPermissionOverride {
    const domain = new UserPermissionOverride();
    domain.id = entity.id;
    domain.userId = entity.userId;
    domain.tenantId = entity.tenantId;
    domain.permissionId = entity.permissionId;
    domain.action = entity.action;
    domain.scope = entity.scope;
    domain.grantedBy = entity.grantedBy;
    domain.createdAt = entity.createdAt;
    return domain;
  }

  static toPersistence(
    domain: UserPermissionOverride,
  ): UserPermissionOverrideEntity {
    const entity = new UserPermissionOverrideEntity();
    if (domain.id) entity.id = domain.id;
    entity.userId = domain.userId;
    entity.tenantId = domain.tenantId;
    entity.permissionId = domain.permissionId;
    entity.action = domain.action;
    entity.scope = domain.scope;
    entity.grantedBy = domain.grantedBy;
    return entity;
  }
}
