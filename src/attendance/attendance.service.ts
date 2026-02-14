import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { StudentAttendanceRepository } from '../lms/student/infrastructure/persistence/student-attendance.repository';
import { StaffAttendanceRepository } from '../lms/staff/infrastructure/persistence/staff-attendance.repository';
import { LeaveRequestRepository } from '../lms/student/infrastructure/persistence/leave-request.repository';
import { StaffLeaveRepository } from '../lms/staff/infrastructure/persistence/staff-leave.repository';
import { StudentRepository } from '../lms/student/infrastructure/persistence/student.repository';
import { StaffRepository } from '../lms/staff/infrastructure/persistence/staff.repository';
import { AttendanceCalculatorService } from './attendance-calculator.service';
import { LeaveManagementService } from './leave-management.service';
import { AttendanceStatusEnum } from '../lms/common/enums/attendance-status.enum';
import { LeaveTypeEnum } from '../lms/common/enums/leave-status.enum';

interface MarkAttendanceInput {
  attendableType: 'student' | 'staff';
  attendableId: number;
  date: string;
  status: AttendanceStatusEnum;
  checkIn?: string;
  checkOut?: string;
  remarks?: string;
  sectionId?: number;
}

interface BulkMarkInput {
  date: string;
  sectionId?: number;
  records: Array<{
    attendableType: 'student' | 'staff';
    attendableId: number;
    status: AttendanceStatusEnum;
    checkIn?: string;
    checkOut?: string;
    remarks?: string;
  }>;
}

interface GetAttendanceInput {
  startDate?: string;
  endDate?: string;
  attendableType?: 'student' | 'staff';
  attendableId?: number;
  status?: AttendanceStatusEnum;
  sectionId?: number;
  page?: number;
  limit?: number;
}

interface ApplyLeaveInput {
  attendableType: 'student' | 'staff';
  attendableId: number;
  fromDate: string;
  toDate: string;
  reason: string;
  leaveType: LeaveTypeEnum;
  documentId?: string;
}

interface AlertsInput {
  threshold?: number;
  attendableType?: 'student' | 'staff';
  startDate?: string;
  endDate?: string;
}

interface DetailedReportInput {
  attendableType: 'student' | 'staff';
  attendableId: number;
  startDate: string;
  endDate: string;
}

@Injectable()
export class AttendanceService {
  constructor(
    private readonly studentAttendanceRepo: StudentAttendanceRepository,
    private readonly staffAttendanceRepo: StaffAttendanceRepository,
    private readonly leaveRequestRepo: LeaveRequestRepository,
    private readonly staffLeaveRepo: StaffLeaveRepository,
    private readonly studentRepo: StudentRepository,
    private readonly staffRepo: StaffRepository,
    private readonly calculator: AttendanceCalculatorService,
  ) {}

  private get leaveService(): LeaveManagementService {
    return new LeaveManagementService(
      this.leaveRequestRepo,
      this.staffLeaveRepo,
      this.studentAttendanceRepo,
      this.staffAttendanceRepo,
    );
  }

  // ─── Mark Individual Attendance ───────────────────────
  async markAttendance(dto: MarkAttendanceInput) {
    // Validate status enum
    if (!Object.values(AttendanceStatusEnum).includes(dto.status)) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { status: 'Invalid attendance status' },
      });
    }

    // Validate date not in future
    const markDate = new Date(dto.date);
    if (markDate > new Date()) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { date: 'Cannot mark attendance for future dates' },
      });
    }

    const dateStr = markDate.toISOString().split('T')[0];

    if (dto.attendableType === 'student') {
      // Check duplicate
      const existing = await this.studentAttendanceRepo.findAll();
      const dup = existing.find(
        (r: any) =>
          r.studentId === dto.attendableId &&
          new Date(r.date).toISOString().split('T')[0] === dateStr,
      );
      if (dup) {
        throw new ConflictException({
          status: 409,
          errors: { attendance: 'Attendance already marked for this date' },
        });
      }

      const record = await this.studentAttendanceRepo.create({
        studentId: dto.attendableId,
        sectionId: dto.sectionId ?? null,
        date: markDate,
        status: dto.status,
        remarks: dto.remarks ?? null,
      } as any);

      return {
        ...record,
        attendableType: 'student',
        attendableId: dto.attendableId,
      };
    } else {
      // Staff attendance
      const existing = await this.staffAttendanceRepo.findAll();
      const dup = existing.find(
        (r: any) =>
          r.staffId === dto.attendableId &&
          new Date(r.date).toISOString().split('T')[0] === dateStr,
      );
      if (dup) {
        throw new ConflictException({
          status: 409,
          errors: { attendance: 'Attendance already marked for this date' },
        });
      }

      const record = await this.staffAttendanceRepo.create({
        staffId: dto.attendableId,
        date: markDate,
        status: dto.status,
        checkIn: dto.checkIn ?? null,
        checkOut: dto.checkOut ?? null,
        remarks: dto.remarks ?? null,
      } as any);

      return {
        ...record,
        attendableType: 'staff',
        attendableId: dto.attendableId,
      };
    }
  }

  // ─── Bulk Mark Attendance ─────────────────────────────
  async bulkMarkAttendance(dto: BulkMarkInput) {
    const markDate = new Date(dto.date);
    if (markDate > new Date()) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { date: 'Cannot mark attendance for future dates' },
      });
    }

    const dateStr = markDate.toISOString().split('T')[0];
    let marked = 0;
    let skipped = 0;

    // Pre-fetch existing records
    const existingStudentRecords = await this.studentAttendanceRepo.findAll();
    const existingStaffRecords = await this.staffAttendanceRepo.findAll();

    for (const record of dto.records) {
      if (record.attendableType === 'student') {
        const dup = existingStudentRecords.find(
          (r: any) =>
            r.studentId === record.attendableId &&
            new Date(r.date).toISOString().split('T')[0] === dateStr,
        );
        if (dup) {
          skipped++;
          continue;
        }

        await this.studentAttendanceRepo.create({
          studentId: record.attendableId,
          sectionId: dto.sectionId ?? null,
          date: markDate,
          status: record.status,
          remarks: record.remarks ?? null,
        } as any);
        marked++;
      } else {
        const dup = existingStaffRecords.find(
          (r: any) =>
            r.staffId === record.attendableId &&
            new Date(r.date).toISOString().split('T')[0] === dateStr,
        );
        if (dup) {
          skipped++;
          continue;
        }

        await this.staffAttendanceRepo.create({
          staffId: record.attendableId,
          date: markDate,
          status: record.status,
          checkIn: record.checkIn ?? null,
          checkOut: record.checkOut ?? null,
          remarks: record.remarks ?? null,
        } as any);
        marked++;
      }
    }

    return { marked, skipped, total: dto.records.length };
  }

  // ─── Get Attendance (filtered + paginated) ────────────
  async getAttendance(query: GetAttendanceInput) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    let results: any[] = [];

    // Collect student records if not filtering for staff only
    if (!query.attendableType || query.attendableType === 'student') {
      const studentRecords = await this.studentAttendanceRepo.findAll();
      results.push(
        ...studentRecords.map((r: any) => ({
          ...r,
          attendableType: 'student',
          attendableId: r.studentId,
        })),
      );
    }

    // Collect staff records if not filtering for student only
    if (!query.attendableType || query.attendableType === 'staff') {
      const staffRecords = await this.staffAttendanceRepo.findAll();
      results.push(
        ...staffRecords.map((r: any) => ({
          ...r,
          attendableType: 'staff',
          attendableId: r.staffId,
        })),
      );
    }

    // Filter by date range
    if (query.startDate) {
      const start = new Date(query.startDate);
      results = results.filter((r) => new Date(r.date) >= start);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      results = results.filter((r) => new Date(r.date) <= end);
    }

    // Filter by status
    if (query.status) {
      results = results.filter((r) => r.status === query.status);
    }

    // Filter by attendableId
    if (query.attendableId) {
      results = results.filter((r) => r.attendableId === query.attendableId);
    }

    // Pagination
    const start = (page - 1) * limit;
    const data = results.slice(start, start + limit);
    const hasNextPage = start + limit < results.length;

    return { data, hasNextPage };
  }

  // ─── Attendance Summary (percentage + counts) ─────────
  async getSummary(query: {
    attendableType: 'student' | 'staff';
    attendableId: number;
    startDate: string;
    endDate: string;
    groupBy?: string;
  }) {
    const startD = new Date(query.startDate);
    const endD = new Date(query.endDate);

    let records: any[];
    if (query.attendableType === 'student') {
      const all = await this.studentAttendanceRepo.findAll();
      records = all.filter(
        (r: any) =>
          r.studentId === query.attendableId &&
          new Date(r.date) >= startD &&
          new Date(r.date) <= endD,
      );
    } else {
      const all = await this.staffAttendanceRepo.findAll();
      records = all.filter(
        (r: any) =>
          r.staffId === query.attendableId &&
          new Date(r.date) >= startD &&
          new Date(r.date) <= endD,
      );
    }

    const summary = this.calculator.calculateSummary(records);
    return summary;
  }

  // ─── Leave Management (delegates) ─────────────────────
  async applyLeave(input: ApplyLeaveInput) {
    return this.leaveService.applyLeave(input);
  }

  async approveLeave(
    leaveId: number,
    attendableType: 'student' | 'staff',
    input: { adminRemarks?: string; approvedById: number },
  ) {
    return this.leaveService.approveLeave(leaveId, attendableType, input);
  }

  async rejectLeave(
    leaveId: number,
    attendableType: 'student' | 'staff',
    input: { adminRemarks?: string },
  ) {
    return this.leaveService.rejectLeave(leaveId, attendableType, input);
  }

  // ─── Alerts (low attendance) ──────────────────────────
  async getAlerts(query: AlertsInput) {
    const threshold = query.threshold || 75;
    const startD = query.startDate ? new Date(query.startDate) : null;
    const endD = query.endDate ? new Date(query.endDate) : null;
    const alerts: any[] = [];

    if (!query.attendableType || query.attendableType === 'student') {
      const students = await this.studentRepo.findAll();
      const allRecords = await this.studentAttendanceRepo.findAll();

      for (const student of students) {
        let records = allRecords.filter(
          (r: any) => r.studentId === (student as any).id,
        );
        if (startD) {
          records = records.filter((r: any) => new Date(r.date) >= startD);
        }
        if (endD) {
          records = records.filter((r: any) => new Date(r.date) <= endD);
        }

        if (records.length === 0) continue;

        const pct = this.calculator.calculatePercentage(records);
        if (pct < threshold) {
          alerts.push({
            attendableType: 'student',
            attendableId: (student as any).id,
            percentage: pct,
            totalRecords: records.length,
          });
        }
      }
    }

    if (!query.attendableType || query.attendableType === 'staff') {
      const staffMembers = await this.staffRepo.findAll();
      const allRecords = await this.staffAttendanceRepo.findAll();

      for (const staff of staffMembers) {
        let records = allRecords.filter(
          (r: any) => r.staffId === (staff as any).id,
        );
        if (startD) {
          records = records.filter((r: any) => new Date(r.date) >= startD);
        }
        if (endD) {
          records = records.filter((r: any) => new Date(r.date) <= endD);
        }

        if (records.length === 0) continue;

        const pct = this.calculator.calculatePercentage(records);
        if (pct < threshold) {
          alerts.push({
            attendableType: 'staff',
            attendableId: (staff as any).id,
            percentage: pct,
            totalRecords: records.length,
          });
        }
      }
    }

    return alerts;
  }

  // ─── Detailed Report ──────────────────────────────────
  async getDetailedReport(query: DetailedReportInput) {
    const startD = new Date(query.startDate);
    const endD = new Date(query.endDate);

    let records: any[];
    let leaves: any[];

    if (query.attendableType === 'student') {
      const allAtt = await this.studentAttendanceRepo.findAll();
      records = allAtt.filter(
        (r: any) =>
          r.studentId === query.attendableId &&
          new Date(r.date) >= startD &&
          new Date(r.date) <= endD,
      );

      const allLeaves = await this.leaveRequestRepo.findAll();
      leaves = allLeaves.filter(
        (l: any) =>
          l.studentId === query.attendableId &&
          new Date(l.fromDate) <= endD &&
          new Date(l.toDate) >= startD,
      );
    } else {
      const allAtt = await this.staffAttendanceRepo.findAll();
      records = allAtt.filter(
        (r: any) =>
          r.staffId === query.attendableId &&
          new Date(r.date) >= startD &&
          new Date(r.date) <= endD,
      );

      const allLeaves = await this.staffLeaveRepo.findAll();
      leaves = allLeaves.filter(
        (l: any) =>
          l.staffId === query.attendableId &&
          new Date(l.fromDate) <= endD &&
          new Date(l.toDate) >= startD,
      );
    }

    const summary = this.calculator.calculateSummary(records);

    return { records, summary, leaves };
  }
}
