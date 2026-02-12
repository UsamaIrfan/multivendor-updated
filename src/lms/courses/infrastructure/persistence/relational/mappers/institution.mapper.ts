import { Institution } from '../../../../domain/institution';
import { InstitutionEntity } from '../entities/institution.entity';

export class InstitutionMapper {
  static toDomain(entity: InstitutionEntity): Institution {
    const domain = new Institution();
    domain.id = entity.id;
    domain.name = entity.name;
    domain.code = entity.code;
    domain.address = entity.address;
    domain.city = entity.city;
    domain.state = entity.state;
    domain.country = entity.country;
    domain.phone = entity.phone;
    domain.email = entity.email;
    domain.website = entity.website;
    domain.logo = entity.logo;
    domain.isActive = entity.isActive;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Institution): InstitutionEntity {
    const entity = new InstitutionEntity();
    if (domain.id) entity.id = domain.id;
    entity.name = domain.name;
    entity.code = domain.code;
    entity.address = domain.address;
    entity.city = domain.city;
    entity.state = domain.state;
    entity.country = domain.country;
    entity.phone = domain.phone;
    entity.email = domain.email;
    entity.website = domain.website;
    entity.logo = domain.logo;
    entity.isActive = domain.isActive;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
