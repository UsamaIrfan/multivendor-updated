import { Branch } from '../../../../domain/branch';
import { BranchEntity } from '../entities/branch.entity';

export class BranchMapper {
  static toDomain(entity: BranchEntity): Branch {
    const domain = new Branch();
    domain.id = entity.id;
    domain.tenantId = entity.tenant?.id;
    domain.name = entity.name;
    domain.code = entity.code;
    domain.address = entity.address;
    domain.city = entity.city;
    domain.state = entity.state;
    domain.country = entity.country;
    domain.phone = entity.phone;
    domain.email = entity.email;
    domain.isActive = entity.isActive;
    domain.isHeadquarters = entity.isHeadquarters;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Branch): BranchEntity {
    const entity = new BranchEntity();
    if (domain.id) entity.id = domain.id;
    entity.tenant = { id: domain.tenantId } as any;
    entity.name = domain.name;
    entity.code = domain.code;
    entity.address = domain.address;
    entity.city = domain.city;
    entity.state = domain.state;
    entity.country = domain.country;
    entity.phone = domain.phone;
    entity.email = domain.email;
    entity.isActive = domain.isActive;
    entity.isHeadquarters = domain.isHeadquarters;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
