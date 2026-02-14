import { Tenant } from '../../../../domain/tenant';
import { TenantEntity } from '../entities/tenant.entity';

export class TenantMapper {
  static toDomain(entity: TenantEntity): Tenant {
    const domain = new Tenant();
    domain.id = entity.id;
    domain.name = entity.name;
    domain.slug = entity.slug;
    domain.contactEmail = entity.contactEmail;
    domain.contactPhone = entity.contactPhone;
    domain.isActive = entity.isActive;
    domain.settings = entity.settings;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Tenant): TenantEntity {
    const entity = new TenantEntity();
    if (domain.id) entity.id = domain.id;
    entity.name = domain.name;
    entity.slug = domain.slug;
    entity.contactEmail = domain.contactEmail;
    entity.contactPhone = domain.contactPhone;
    entity.isActive = domain.isActive;
    entity.settings = domain.settings;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
