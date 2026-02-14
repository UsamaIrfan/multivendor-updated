import { AttendanceStatusEnum } from '../../lms/common/enums/attendance-status.enum';

/**
 * Unified attendance domain model.
 * Wraps both student and staff attendance records into a polymorphic view.
 */
export class Attendance {
  id: number;
  attendableType: 'student' | 'staff';
  attendableId: number;
  date: Date;
  status: AttendanceStatusEnum;
  sectionId?: number | null;
  checkIn?: string | null;
  checkOut?: string | null;
  remarks?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
