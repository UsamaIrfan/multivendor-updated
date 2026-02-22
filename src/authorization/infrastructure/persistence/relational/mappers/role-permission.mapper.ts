import { RolePermission } from '../../../../domain/role-permission';
import { RolePermissionEntity } from '../entities/role-permission.entity';

export class RolePermissionMapper {
  static toDomain(entity: RolePermissionEntity): RolePermission {
    const domain = new RolePermission();
    domain.id = entity.id;
    domain.roleId = entity.roleId;
    domain.permissionId = entity.permissionId;
    domain.scope = entity.scope;
    return domain;
  }

  static toPersistence(domain: RolePermission): RolePermissionEntity {
    const entity = new RolePermissionEntity();
    if (domain.id) entity.id = domain.id;
    entity.roleId = domain.roleId;
    entity.permissionId = domain.permissionId;
    entity.scope = domain.scope;
    return entity;
  }
}
