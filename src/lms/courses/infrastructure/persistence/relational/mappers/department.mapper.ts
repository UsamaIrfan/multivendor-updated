import { Department } from '../../../../domain/department';
import { DepartmentEntity } from '../entities/department.entity';

export class DepartmentMapper {
  static toDomain(entity: DepartmentEntity): Department {
    const domain = new Department();
    domain.id = entity.id;
    domain.institutionId = entity.institution?.id;
    domain.name = entity.name;
    domain.code = entity.code;
    domain.description = entity.description;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Department): DepartmentEntity {
    const entity = new DepartmentEntity();
    if (domain.id) entity.id = domain.id;
    entity.name = domain.name;
    entity.code = domain.code;
    entity.description = domain.description;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
