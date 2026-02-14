import { GradingScale } from '../../../../domain/grading-scale';
import { GradingScaleEntity } from '../entities/grading-scale.entity';

export class GradingScaleMapper {
  static toDomain(entity: GradingScaleEntity): GradingScale {
    const domain = new GradingScale();
    domain.id = entity.id;
    domain.name = entity.name;
    domain.grades = entity.grades;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: GradingScale): GradingScaleEntity {
    const entity = new GradingScaleEntity();
    if (domain.id) entity.id = domain.id;
    entity.name = domain.name;
    entity.grades = domain.grades;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
