import { StudentEnrollment } from '../../../../domain/student-enrollment';
import { StudentEnrollmentEntity } from '../entities/student-enrollment.entity';
import { StudentEntity } from '../entities/student.entity';
import { SectionEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/section.entity';
import { AcademicYearEntity } from '../../../../../academic/infrastructure/persistence/relational/entities/academic-year.entity';

export class StudentEnrollmentMapper {
  static toDomain(entity: StudentEnrollmentEntity): StudentEnrollment {
    const domain = new StudentEnrollment();
    domain.id = entity.id;
    domain.studentId = entity.student?.id;
    domain.sectionId = entity.section?.id;
    domain.academicYearId = entity.academicYear?.id;
    domain.status = entity.status;
    domain.enrollmentDate = entity.enrollmentDate;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: StudentEnrollment): StudentEnrollmentEntity {
    const entity = new StudentEnrollmentEntity();
    if (domain.id) entity.id = domain.id;

    if (domain.studentId) {
      const student = new StudentEntity();
      student.id = domain.studentId;
      entity.student = student;
    }

    if (domain.sectionId) {
      const section = new SectionEntity();
      section.id = domain.sectionId;
      entity.section = section;
    }

    if (domain.academicYearId) {
      const academicYear = new AcademicYearEntity();
      academicYear.id = domain.academicYearId;
      entity.academicYear = academicYear;
    }

    entity.status = domain.status;
    entity.enrollmentDate = domain.enrollmentDate;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
