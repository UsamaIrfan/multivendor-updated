import { AcademicYear } from '../../../../domain/academic-year';
import { AcademicYearEntity } from '../entities/academic-year.entity';

export class AcademicYearMapper {
  static toDomain(entity: AcademicYearEntity): AcademicYear {
    const domain = new AcademicYear();
    domain.id = entity.id;
    domain.institutionId = entity.institution?.id;
    domain.name = entity.name;
    domain.startDate = entity.startDate;
    domain.endDate = entity.endDate;
    domain.isCurrent = entity.isCurrent;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: AcademicYear): AcademicYearEntity {
    const entity = new AcademicYearEntity();
    if (domain.id) entity.id = domain.id;
    entity.name = domain.name;
    entity.startDate = domain.startDate;
    entity.endDate = domain.endDate;
    entity.isCurrent = domain.isCurrent;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
