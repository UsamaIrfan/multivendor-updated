import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StaffAttendanceRecordRepository } from './infrastructure/persistence/staff-attendance-record.repository';
import { StaffLeaveApplicationRepository } from './infrastructure/persistence/staff-leave-application.repository';
import { StaffLeaveBalanceRepository } from './infrastructure/persistence/staff-leave-balance.repository';
import { TenantContextService } from '../tenant/tenant-context/tenant-context.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { ApplyStaffLeaveDto } from './dto/apply-staff-leave.dto';
import {
  ApproveStaffLeaveDto,
  RejectStaffLeaveDto,
} from './dto/approve-staff-leave.dto';
import { QueryAttendanceReportDto } from './dto/query-attendance-report.dto';
import { QueryStaffLeaveDto } from './dto/query-staff-leave.dto';
import { QueryLeaveBalanceDto } from './dto/query-leave-balance.dto';
import { StaffAttendanceRecord } from './domain/staff-attendance-record';
import { StaffLeaveApplication } from './domain/staff-leave-application';
import { StaffLeaveBalance } from './domain/staff-leave-balance';
import { AttendanceStatusEnum } from '../lms/common/enums/attendance-status.enum';
import { LeaveStatusEnum } from '../lms/common/enums/leave-status.enum';

@Injectable()
export class StaffAttendanceService {
  constructor(
    private readonly attendanceRepo: StaffAttendanceRecordRepository,
    private readonly leaveAppRepo: StaffLeaveApplicationRepository,
    private readonly leaveBalanceRepo: StaffLeaveBalanceRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  // ─── Attendance: Check-In ───────────────────────────────

  async checkIn(dto: CheckInDto): Promise<StaffAttendanceRecord> {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Prevent duplicate check-in for same staff on same day
    const existing = await this.attendanceRepo.findByStaffAndDate(
      dto.staffId,
      today,
    );
    if (existing) {
      throw new ConflictException(
        `Staff ${dto.staffId} already checked in for ${today}`,
      );
    }

    const tenantId = dto.tenantId || this.tenantContext.getTenantId();
    const branchId = dto.branchId || this.tenantContext.getBranchId() || null;

    return this.attendanceRepo.create({
      staffId: dto.staffId,
      date: today,
      checkInTime: new Date(),
      checkOutTime: null,
      status: AttendanceStatusEnum.present,
      remarks: dto.remarks ?? null,
      tenantId,
      branchId,
    } as StaffAttendanceRecord);
  }

  // ─── Attendance: Check-Out ──────────────────────────────

  async checkOut(dto: CheckOutDto): Promise<StaffAttendanceRecord> {
    const today = new Date().toISOString().slice(0, 10);

    const record = await this.attendanceRepo.findByStaffAndDate(
      dto.staffId,
      today,
    );
    if (!record) {
      throw new NotFoundException(
        `No check-in found for staff ${dto.staffId} on ${today}`,
      );
    }

    const updated = await this.attendanceRepo.update(record.id, {
      checkOutTime: new Date(),
    });
    if (!updated) {
      throw new NotFoundException('Failed to update attendance record');
    }
    return updated;
  }

  // ─── Attendance: Reports ────────────────────────────────

  async getReports(
    query: QueryAttendanceReportDto,
  ): Promise<StaffAttendanceRecord[]> {
    return this.attendanceRepo.findByFilters({
      staffId: query.staffId,
      branchId: query.branchId,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  // ─── Leaves: Apply ─────────────────────────────────────

  async applyLeave(dto: ApplyStaffLeaveDto): Promise<StaffLeaveApplication> {
    const fromDate = new Date(dto.fromDate);
    const toDate = new Date(dto.toDate);

    // Check for overlapping active leave requests
    const overlapping = await this.leaveAppRepo.findOverlapping(
      dto.staffId,
      fromDate,
      toDate,
    );
    if (overlapping.length > 0) {
      throw new ConflictException(
        'Overlapping leave request already exists for this period',
      );
    }

    const tenantId = dto.tenantId || this.tenantContext.getTenantId();
    const branchId = dto.branchId || this.tenantContext.getBranchId() || null;

    return this.leaveAppRepo.create({
      staffId: dto.staffId,
      fromDate,
      toDate,
      leaveType: dto.leaveType,
      reason: dto.reason,
      status: LeaveStatusEnum.pending,
      approvedById: null,
      adminRemarks: null,
      tenantId,
      branchId,
    } as StaffLeaveApplication);
  }

  // ─── Leaves: List ──────────────────────────────────────

  async getLeaves(query: QueryStaffLeaveDto): Promise<StaffLeaveApplication[]> {
    if (query.staffId) {
      return this.leaveAppRepo.findByStaffId(query.staffId);
    }
    return this.leaveAppRepo.findAll();
  }

  // ─── Leaves: Get Balance ────────────────────────────────

  async getLeaveBalance(
    query: QueryLeaveBalanceDto,
  ): Promise<StaffLeaveBalance[]> {
    return this.leaveBalanceRepo.findByFilters({
      staffId: query.staffId,
      leaveType: query.leaveType,
      year: query.year,
    });
  }

  // ─── Leaves: Approve ───────────────────────────────────

  async approveLeave(
    id: number,
    dto: ApproveStaffLeaveDto,
    approvedById: number,
  ): Promise<StaffLeaveApplication> {
    const leave = await this.leaveAppRepo.findById(id);
    if (!leave) {
      throw new NotFoundException(`Leave application #${id} not found`);
    }

    const updated = await this.leaveAppRepo.update(id, {
      status: LeaveStatusEnum.approved,
      approvedById,
      adminRemarks: dto.adminRemarks ?? null,
    });
    if (!updated) {
      throw new NotFoundException('Failed to approve leave');
    }

    // Deduct from balance
    await this.deductLeaveBalance(leave);

    return updated;
  }

  // ─── Leaves: Reject ────────────────────────────────────

  async rejectLeave(
    id: number,
    dto: RejectStaffLeaveDto,
  ): Promise<StaffLeaveApplication> {
    const leave = await this.leaveAppRepo.findById(id);
    if (!leave) {
      throw new NotFoundException(`Leave application #${id} not found`);
    }

    const updated = await this.leaveAppRepo.update(id, {
      status: LeaveStatusEnum.rejected,
      adminRemarks: dto.adminRemarks ?? null,
    });
    if (!updated) {
      throw new NotFoundException('Failed to reject leave');
    }
    return updated;
  }

  // ─── Private Helpers ────────────────────────────────────

  private async deductLeaveBalance(
    leave: StaffLeaveApplication,
  ): Promise<void> {
    const year = leave.fromDate.getFullYear();
    const leaveDays = this.calculateLeaveDays(leave.fromDate, leave.toDate);

    const balance = await this.leaveBalanceRepo.findByStaffAndType(
      leave.staffId,
      leave.leaveType,
      year,
    );

    if (balance) {
      await this.leaveBalanceRepo.update(balance.id, {
        usedDays: Number(balance.usedDays) + leaveDays,
      });
    } else {
      // Auto-create balance record if not pre-configured
      await this.leaveBalanceRepo.create({
        staffId: leave.staffId,
        leaveType: leave.leaveType,
        totalDays: 0,
        usedDays: leaveDays,
        year,
        tenantId: leave.tenantId,
        branchId: leave.branchId,
      } as StaffLeaveBalance);
    }
  }

  private calculateLeaveDays(fromDate: Date, toDate: Date): number {
    const diffMs = new Date(toDate).getTime() - new Date(fromDate).getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1; // inclusive
  }
}
