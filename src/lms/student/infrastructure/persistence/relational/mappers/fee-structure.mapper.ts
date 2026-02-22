import { FeeStructure } from '../../../../domain/fee-structure';
import { FeeStructureEntity } from '../entities/fee-structure.entity';
import { InstitutionEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/institution.entity';
import { GradeClassEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/grade-class.entity';
import { AcademicYearEntity } from '../../../../../academic/infrastructure/persistence/relational/entities/academic-year.entity';

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

    if (domain.institutionId) {
      const institution = new InstitutionEntity();
      institution.id = domain.institutionId;
      entity.institution = institution;
    }

    if (domain.gradeClassId) {
      const gradeClass = new GradeClassEntity();
      gradeClass.id = domain.gradeClassId;
      entity.gradeClass = gradeClass;
    } else {
      entity.gradeClass = null;
    }

    if (domain.academicYearId) {
      const academicYear = new AcademicYearEntity();
      academicYear.id = domain.academicYearId;
      entity.academicYear = academicYear;
    } else {
      entity.academicYear = null;
    }

    entity.name = domain.name;
    entity.amount = domain.amount;
    entity.frequency = domain.frequency;
    entity.description = domain.description;
    if (domain.tenantId !== undefined) entity.tenantId = domain.tenantId;
    if (domain.branchId !== undefined) entity.branchId = domain.branchId;
    if (domain.createdAt !== undefined) entity.createdAt = domain.createdAt;
    if (domain.updatedAt !== undefined) entity.updatedAt = domain.updatedAt;
    if (domain.deletedAt !== undefined) entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
