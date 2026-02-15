import { StaffAttendanceRecordEntity } from '../entities/staff-attendance-record.entity';
import { StaffAttendanceRecord } from '../../../../domain/staff-attendance-record';

export class StaffAttendanceRecordMapper {
  static toDomain(entity: StaffAttendanceRecordEntity): StaffAttendanceRecord {
    const domain = new StaffAttendanceRecord();
    domain.id = entity.id;
    domain.staffId = entity.staffId;
    domain.date = entity.date;
    domain.status = entity.status;
    domain.checkInTime = entity.checkInTime;
    domain.checkOutTime = entity.checkOutTime;
    domain.remarks = entity.remarks;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(
    domain: StaffAttendanceRecord,
  ): StaffAttendanceRecordEntity {
    const entity = new StaffAttendanceRecordEntity();
    if (domain.id) entity.id = domain.id;
    entity.staff = { id: domain.staffId } as any;
    entity.staffId = domain.staffId;
    entity.date = domain.date;
    entity.status = domain.status;
    entity.checkInTime = domain.checkInTime;
    entity.checkOutTime = domain.checkOutTime;
    entity.remarks = domain.remarks;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    return entity;
  }
}
