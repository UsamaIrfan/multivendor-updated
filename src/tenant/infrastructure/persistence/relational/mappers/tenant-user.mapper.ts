import { TenantUser } from '../../../../domain/tenant-user';
import { TenantUserEntity } from '../entities/tenant-user.entity';

export class TenantUserMapper {
  static toDomain(entity: TenantUserEntity): TenantUser {
    const domain = new TenantUser();
    domain.id = entity.id;
    domain.tenantId = entity.tenant?.id;
    domain.tenantName = entity.tenant?.name;
    domain.userId = entity.user?.id;
    domain.userName = entity.user
      ? [entity.user.firstName, entity.user.lastName]
          .filter(Boolean)
          .join(' ') || undefined
      : undefined;
    domain.userEmail = entity.user?.email ?? undefined;
    domain.userRole =
      entity.user?.role && typeof entity.user.role === 'object'
        ? entity.user.role.id
        : undefined;
    domain.isActive = entity.isActive;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: TenantUser): TenantUserEntity {
    const entity = new TenantUserEntity();
    if (domain.id) entity.id = domain.id;
    entity.tenant = { id: domain.tenantId } as any;
    entity.user = { id: domain.userId } as any;
    entity.isActive = domain.isActive;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
