import { StaffAttendance } from '../../../../domain/staff-attendance';
import { StaffAttendanceEntity } from '../entities/staff-attendance.entity';

export class StaffAttendanceMapper {
  static toDomain(entity: StaffAttendanceEntity): StaffAttendance {
    const domain = new StaffAttendance();
    domain.id = entity.id;
    domain.staffId = entity.staff?.id ?? 0;
    domain.date = entity.date;
    domain.status = entity.status;
    domain.checkIn = entity.checkIn;
    domain.checkOut = entity.checkOut;
    domain.remarks = entity.remarks;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: StaffAttendance): StaffAttendanceEntity {
    const entity = new StaffAttendanceEntity();
    if (domain.id) entity.id = domain.id;
    entity.staff = { id: domain.staffId } as any;
    entity.date = domain.date;
    entity.status = domain.status;
    entity.checkIn = domain.checkIn;
    entity.checkOut = domain.checkOut;
    entity.remarks = domain.remarks;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    return entity;
  }
}
