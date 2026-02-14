import {
  LeaveStatusEnum,
  LeaveTypeEnum,
} from '../../lms/common/enums/leave-status.enum';

/**
 * Unified leave domain model.
 * Wraps both student leave requests and staff leaves into a polymorphic view.
 */
export class Leave {
  id: number;
  attendableType: 'student' | 'staff';
  attendableId: number;
  fromDate: Date;
  toDate: Date;
  reason: string;
  leaveType: LeaveTypeEnum;
  status: LeaveStatusEnum;
  approvedById?: number | null;
  adminRemarks?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
