import { StudentAttendance } from '../../../../domain/student-attendance';
import { StudentAttendanceEntity } from '../entities/student-attendance.entity';
import { StudentEntity } from '../entities/student.entity';
import { SectionEntity } from '../../../../../courses/infrastructure/persistence/relational/entities/section.entity';

export class StudentAttendanceMapper {
  static toDomain(entity: StudentAttendanceEntity): StudentAttendance {
    const domain = new StudentAttendance();
    domain.id = entity.id;
    domain.studentId = entity.student?.id;
    domain.sectionId = entity.section?.id;
    domain.date = entity.date;
    domain.status = entity.status;
    domain.remarks = entity.remarks;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: StudentAttendance): StudentAttendanceEntity {
    const entity = new StudentAttendanceEntity();
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

    entity.date = domain.date;
    entity.status = domain.status;
    entity.remarks = domain.remarks;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
