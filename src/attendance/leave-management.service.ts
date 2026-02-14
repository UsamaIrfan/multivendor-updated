import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { LeaveRequestRepository } from '../lms/student/infrastructure/persistence/leave-request.repository';
import { StaffLeaveRepository } from '../lms/staff/infrastructure/persistence/staff-leave.repository';
import { StudentAttendanceRepository } from '../lms/student/infrastructure/persistence/student-attendance.repository';
import { StaffAttendanceRepository } from '../lms/staff/infrastructure/persistence/staff-attendance.repository';
import {
  LeaveStatusEnum,
  LeaveTypeEnum,
} from '../lms/common/enums/leave-status.enum';
import { AttendanceStatusEnum } from '../lms/common/enums/attendance-status.enum';

interface ApplyLeaveInput {
  attendableType: 'student' | 'staff';
  attendableId: number;
  fromDate: string;
  toDate: string;
  reason: string;
  leaveType: LeaveTypeEnum;
  documentId?: string;
}

interface ApproveInput {
  adminRemarks?: string;
  approvedById: number;
}

interface RejectInput {
  adminRemarks?: string;
}

interface LeaveRange {
  attendableId: number;
  fromDate: Date;
  toDate: Date;
}

@Injectable()
export class LeaveManagementService {
  constructor(
    private readonly leaveRequestRepo: LeaveRequestRepository,
    private readonly staffLeaveRepo: StaffLeaveRepository,
    private readonly studentAttendanceRepo: StudentAttendanceRepository,
    private readonly staffAttendanceRepo: StaffAttendanceRepository,
  ) {}

  async applyLeave(input: ApplyLeaveInput) {
    const from = new Date(input.fromDate);
    const to = new Date(input.toDate);

    // Validate date range
    if (from > to) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { dates: 'fromDate must be before or equal to toDate' },
      });
    }

    // Validate leave type
    if (!Object.values(LeaveTypeEnum).includes(input.leaveType)) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { leaveType: 'Invalid leave type' },
      });
    }

    // Check for overlap
    if (input.attendableType === 'student') {
      const existing = await this.leaveRequestRepo.findAll();
      const overlap = existing.find(
        (l: any) =>
          l.studentId === input.attendableId &&
          l.status !== LeaveStatusEnum.rejected &&
          l.status !== LeaveStatusEnum.cancelled &&
          new Date(l.fromDate) <= to &&
          new Date(l.toDate) >= from,
      );
      if (overlap) {
        throw new ConflictException({
          status: 409,
          errors: { leave: 'Leave dates overlap with an existing application' },
        });
      }

      return this.leaveRequestRepo.create({
        studentId: input.attendableId,
        fromDate: from,
        toDate: to,
        reason: input.reason,
        status: LeaveStatusEnum.pending,
      } as any);
    } else {
      const existing = await this.staffLeaveRepo.findAll();
      const overlap = existing.find(
        (l: any) =>
          l.staffId === input.attendableId &&
          l.status !== LeaveStatusEnum.rejected &&
          l.status !== LeaveStatusEnum.cancelled &&
          new Date(l.fromDate) <= to &&
          new Date(l.toDate) >= from,
      );
      if (overlap) {
        throw new ConflictException({
          status: 409,
          errors: { leave: 'Leave dates overlap with an existing application' },
        });
      }

      return this.staffLeaveRepo.create({
        staffId: input.attendableId,
        fromDate: from,
        toDate: to,
        leaveType: input.leaveType,
        reason: input.reason,
        status: LeaveStatusEnum.pending,
      } as any);
    }
  }

  async approveLeave(
    leaveId: number,
    attendableType: 'student' | 'staff',
    input: ApproveInput,
  ) {
    const repo =
      attendableType === 'student'
        ? this.leaveRequestRepo
        : this.staffLeaveRepo;

    const leave = await repo.findById(leaveId);
    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if ((leave as any).status !== LeaveStatusEnum.pending) {
      throw new ConflictException({
        status: 409,
        errors: { leave: 'Leave has already been processed' },
      });
    }

    const updated = await repo.update(leaveId, {
      status: LeaveStatusEnum.approved,
      adminRemarks: input.adminRemarks ?? null,
      approvedById: input.approvedById,
    } as any);

    // Retroactive attendance update
    await this.updateAttendanceForApprovedLeave(attendableType, {
      attendableId:
        attendableType === 'student'
          ? (leave as any).studentId
          : (leave as any).staffId,
      fromDate: new Date((leave as any).fromDate),
      toDate: new Date((leave as any).toDate),
    });

    return updated;
  }

  async rejectLeave(
    leaveId: number,
    attendableType: 'student' | 'staff',
    input: RejectInput,
  ) {
    const repo =
      attendableType === 'student'
        ? this.leaveRequestRepo
        : this.staffLeaveRepo;

    const leave = await repo.findById(leaveId);
    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if ((leave as any).status !== LeaveStatusEnum.pending) {
      throw new ConflictException({
        status: 409,
        errors: { leave: 'Leave has already been processed' },
      });
    }

    return repo.update(leaveId, {
      status: LeaveStatusEnum.rejected,
      adminRemarks: input.adminRemarks ?? null,
    } as any);
  }

  /**
   * Update existing attendance records to 'excused' for approved leave dates,
   * and create 'excused' records for dates that don't have attendance yet.
   */
  async updateAttendanceForApprovedLeave(
    attendableType: 'student' | 'staff',
    range: LeaveRange,
  ) {
    const attRepo =
      attendableType === 'student'
        ? this.studentAttendanceRepo
        : this.staffAttendanceRepo;
    const idField = attendableType === 'student' ? 'studentId' : 'staffId';

    const allRecords = await attRepo.findAll();
    const dates = this.getDateRange(range.fromDate, range.toDate);

    for (const d of dates) {
      const dateStr = d.toISOString().split('T')[0];
      const existing = allRecords.find(
        (r: any) =>
          r[idField] === range.attendableId &&
          new Date(r.date).toISOString().split('T')[0] === dateStr,
      );

      if (existing) {
        await attRepo.update((existing as any).id, {
          status: AttendanceStatusEnum.excused,
        } as any);
      } else {
        const createData: any = {
          [idField]: range.attendableId,
          date: d,
          status: AttendanceStatusEnum.excused,
        };
        await attRepo.create(createData);
      }
    }
  }

  private getDateRange(from: Date, to: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(from);
    while (current <= to) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }
}
