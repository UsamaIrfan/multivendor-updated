import { FeeStructure } from '../../../../domain/fee-structure';
import { FeeStructureEntity } from '../entities/fee-structure.entity';

export class FeeStructureMapper {
  static toDomain(entity: FeeStructureEntity): FeeStructure {
    const domain = new FeeStructure();
    domain.id = entity.id;
    domain.institutionId = entity.institution?.id;
    domain.gradeClassId = entity.gradeClass?.id ?? null;
    domain.academicYearId = entity.academicYear?.id ?? null;
    domain.name = entity.name;
    domain.amount = entity.amount;
    domain.frequency = entity.frequency;
    domain.description = entity.description;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: FeeStructure): FeeStructureEntity {
    const entity = new FeeStructureEntity();
    if (domain.id) entity.id = domain.id;
    entity.name = domain.name;
    entity.amount = domain.amount;
    entity.frequency = domain.frequency;
    entity.description = domain.description;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
