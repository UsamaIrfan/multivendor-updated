import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { StaffAttendanceService } from '../staff-attendance.service';
import { StaffAttendanceRecordRepository } from '../infrastructure/persistence/staff-attendance-record.repository';
import { StaffLeaveApplicationRepository } from '../infrastructure/persistence/staff-leave-application.repository';
import { StaffLeaveBalanceRepository } from '../infrastructure/persistence/staff-leave-balance.repository';
import { TenantContextService } from '../../tenant/tenant-context/tenant-context.service';
import { AttendanceStatusEnum } from '../../lms/common/enums/attendance-status.enum';
import {
  LeaveStatusEnum,
  LeaveTypeEnum,
} from '../../lms/common/enums/leave-status.enum';
import { CheckInDto } from '../dto/check-in.dto';
import { CheckOutDto } from '../dto/check-out.dto';
import { ApplyStaffLeaveDto } from '../dto/apply-staff-leave.dto';

// ── Mock Factories ──

function createMockAttendanceRepo() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByStaffAndDate: jest.fn(),
    findByFilters: jest.fn(),
  };
}

function createMockLeaveAppRepo() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByStaffId: jest.fn(),
    findOverlapping: jest.fn(),
  };
}

function createMockLeaveBalanceRepo() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByStaffAndType: jest.fn(),
    findByStaff: jest.fn(),
    findByFilters: jest.fn(),
  };
}

function createMockTenantContext(
  tenantId: string = 'tenant-a-uuid',
  branchId: string | null = 'branch-a1-uuid',
) {
  return {
    getTenantId: jest.fn().mockReturnValue(tenantId),
    getBranchId: jest.fn().mockReturnValue(branchId),
    hasContext: jest.fn().mockReturnValue(true),
    getContext: jest.fn().mockReturnValue({ tenantId, branchId }),
    run: jest.fn(),
  };
}

// ── Constants ──

const TENANT_A = 'tenant-a-uuid';
const BRANCH_A1 = 'branch-a1-uuid';

describe('StaffAttendanceService', () => {
  let service: StaffAttendanceService;
  let attendanceRepo: ReturnType<typeof createMockAttendanceRepo>;
  let leaveAppRepo: ReturnType<typeof createMockLeaveAppRepo>;
  let leaveBalanceRepo: ReturnType<typeof createMockLeaveBalanceRepo>;
  let tenantContext: ReturnType<typeof createMockTenantContext>;

  beforeEach(async () => {
    attendanceRepo = createMockAttendanceRepo();
    leaveAppRepo = createMockLeaveAppRepo();
    leaveBalanceRepo = createMockLeaveBalanceRepo();
    tenantContext = createMockTenantContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffAttendanceService,
        {
          provide: StaffAttendanceRecordRepository,
          useValue: attendanceRepo,
        },
        {
          provide: StaffLeaveApplicationRepository,
          useValue: leaveAppRepo,
        },
        {
          provide: StaffLeaveBalanceRepository,
          useValue: leaveBalanceRepo,
        },
        {
          provide: TenantContextService,
          useValue: tenantContext,
        },
      ],
    }).compile();

    service = module.get<StaffAttendanceService>(StaffAttendanceService);
  });

  // ─── CHECK-IN ──────────────────────────────────────────

  describe('checkIn', () => {
    const today = new Date().toISOString().slice(0, 10);
    const dto: CheckInDto = {
      staffId: 1,
      tenantId: TENANT_A,
      branchId: BRANCH_A1,
    };

    it('should create a new attendance record', async () => {
      attendanceRepo.findByStaffAndDate.mockResolvedValue(null);
      attendanceRepo.create.mockResolvedValue({
        id: 1,
        staffId: 1,
        date: today,
        status: AttendanceStatusEnum.present,
        checkInTime: expect.any(Date),
        checkOutTime: null,
        tenantId: TENANT_A,
        branchId: BRANCH_A1,
      });

      const result = await service.checkIn(dto);

      expect(attendanceRepo.findByStaffAndDate).toHaveBeenCalledWith(1, today);
      expect(attendanceRepo.create).toHaveBeenCalled();
      expect(result.staffId).toBe(1);
      expect(result.status).toBe(AttendanceStatusEnum.present);
    });

    it('should throw ConflictException on duplicate check-in', async () => {
      attendanceRepo.findByStaffAndDate.mockResolvedValue({
        id: 1,
        staffId: 1,
        date: today,
      });

      await expect(service.checkIn(dto)).rejects.toThrow(ConflictException);
    });

    it('should set branchId from context when not in DTO', async () => {
      attendanceRepo.findByStaffAndDate.mockResolvedValue(null);
      attendanceRepo.create.mockImplementation((data) =>
        Promise.resolve({ id: 1, ...data }),
      );

      const dtoNoBranch: CheckInDto = {
        staffId: 1,
        tenantId: TENANT_A,
      };

      await service.checkIn(dtoNoBranch);

      expect(attendanceRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          branchId: BRANCH_A1,
          tenantId: TENANT_A,
        }),
      );
    });
  });

  // ─── CHECK-OUT ─────────────────────────────────────────

  describe('checkOut', () => {
    const dto: CheckOutDto = {
      staffId: 1,
      tenantId: TENANT_A,
      branchId: BRANCH_A1,
    };

    it('should update the attendance record with checkOutTime', async () => {
      attendanceRepo.findByStaffAndDate.mockResolvedValue({
        id: 1,
        staffId: 1,
        checkOutTime: null,
      });
      attendanceRepo.update.mockResolvedValue({
        id: 1,
        staffId: 1,
        checkOutTime: new Date(),
      });

      const result = await service.checkOut(dto);

      expect(attendanceRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ checkOutTime: expect.any(Date) }),
      );
      expect(result.checkOutTime).toBeDefined();
    });

    it('should throw NotFoundException when no check-in exists', async () => {
      attendanceRepo.findByStaffAndDate.mockResolvedValue(null);

      await expect(service.checkOut(dto)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── REPORTS ───────────────────────────────────────────

  describe('getReports', () => {
    it('should call findByFilters with query params', async () => {
      attendanceRepo.findByFilters.mockResolvedValue([]);

      await service.getReports({
        staffId: 1,
        branchId: BRANCH_A1,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      });

      expect(attendanceRepo.findByFilters).toHaveBeenCalledWith({
        staffId: 1,
        branchId: BRANCH_A1,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      });
    });

    it('should return empty array when no records match', async () => {
      attendanceRepo.findByFilters.mockResolvedValue([]);

      const result = await service.getReports({});

      expect(result).toEqual([]);
    });
  });

  // ─── APPLY LEAVE ───────────────────────────────────────

  describe('applyLeave', () => {
    const dto: ApplyStaffLeaveDto = {
      staffId: 1,
      fromDate: '2026-03-01',
      toDate: '2026-03-03',
      leaveType: LeaveTypeEnum.casual,
      reason: 'Family event',
      tenantId: TENANT_A,
      branchId: BRANCH_A1,
    };

    it('should create a pending leave application', async () => {
      leaveAppRepo.findOverlapping.mockResolvedValue([]);
      leaveAppRepo.create.mockResolvedValue({
        id: 1,
        staffId: 1,
        status: LeaveStatusEnum.pending,
        leaveType: LeaveTypeEnum.casual,
      });

      const result = await service.applyLeave(dto);

      expect(leaveAppRepo.findOverlapping).toHaveBeenCalled();
      expect(result.status).toBe(LeaveStatusEnum.pending);
    });

    it('should throw ConflictException for overlapping leave', async () => {
      leaveAppRepo.findOverlapping.mockResolvedValue([
        { id: 99, staffId: 1, status: LeaveStatusEnum.pending },
      ]);

      await expect(service.applyLeave(dto)).rejects.toThrow(ConflictException);
    });
  });

  // ─── LIST LEAVES ───────────────────────────────────────

  describe('getLeaves', () => {
    it('should return leaves by staffId when provided', async () => {
      leaveAppRepo.findByStaffId.mockResolvedValue([{ id: 1 }]);

      const result = await service.getLeaves({ staffId: 1 });

      expect(leaveAppRepo.findByStaffId).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
    });

    it('should return all leaves when no staffId', async () => {
      leaveAppRepo.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const result = await service.getLeaves({});

      expect(leaveAppRepo.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  // ─── LEAVE BALANCE ────────────────────────────────────

  describe('getLeaveBalance', () => {
    it('should return balances filtered by query', async () => {
      leaveBalanceRepo.findByFilters.mockResolvedValue([
        {
          id: 1,
          staffId: 1,
          leaveType: LeaveTypeEnum.casual,
          totalDays: 10,
          usedDays: 2,
          year: 2026,
        },
      ]);

      const result = await service.getLeaveBalance({
        staffId: 1,
        leaveType: LeaveTypeEnum.casual,
        year: 2026,
      });

      expect(leaveBalanceRepo.findByFilters).toHaveBeenCalledWith({
        staffId: 1,
        leaveType: LeaveTypeEnum.casual,
        year: 2026,
      });
      expect(result).toHaveLength(1);
    });
  });

  // ─── APPROVE LEAVE ────────────────────────────────────

  describe('approveLeave', () => {
    it('should approve leave and deduct balance', async () => {
      const leave = {
        id: 1,
        staffId: 1,
        fromDate: new Date('2026-03-01'),
        toDate: new Date('2026-03-03'),
        leaveType: LeaveTypeEnum.casual,
        status: LeaveStatusEnum.pending,
        tenantId: TENANT_A,
        branchId: BRANCH_A1,
      };
      leaveAppRepo.findById.mockResolvedValue(leave);
      leaveAppRepo.update.mockResolvedValue({
        ...leave,
        status: LeaveStatusEnum.approved,
        approvedById: 100,
      });
      leaveBalanceRepo.findByStaffAndType.mockResolvedValue({
        id: 10,
        staffId: 1,
        leaveType: LeaveTypeEnum.casual,
        totalDays: 10,
        usedDays: 0,
        year: 2026,
      });
      leaveBalanceRepo.update.mockResolvedValue({});

      const result = await service.approveLeave(1, {}, 100);

      expect(leaveAppRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          status: LeaveStatusEnum.approved,
          approvedById: 100,
        }),
      );
      expect(leaveBalanceRepo.update).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ usedDays: 3 }),
      );
      expect(result.status).toBe(LeaveStatusEnum.approved);
    });

    it('should create balance record if none exists', async () => {
      const leave = {
        id: 1,
        staffId: 1,
        fromDate: new Date('2026-06-01'),
        toDate: new Date('2026-06-01'),
        leaveType: LeaveTypeEnum.sick,
        status: LeaveStatusEnum.pending,
        tenantId: TENANT_A,
        branchId: BRANCH_A1,
      };
      leaveAppRepo.findById.mockResolvedValue(leave);
      leaveAppRepo.update.mockResolvedValue({
        ...leave,
        status: LeaveStatusEnum.approved,
      });
      leaveBalanceRepo.findByStaffAndType.mockResolvedValue(null);
      leaveBalanceRepo.create.mockResolvedValue({});

      await service.approveLeave(1, {}, 100);

      expect(leaveBalanceRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          staffId: 1,
          leaveType: LeaveTypeEnum.sick,
          totalDays: 0,
          usedDays: 1,
          year: 2026,
        }),
      );
    });

    it('should throw NotFoundException for non-existent leave', async () => {
      leaveAppRepo.findById.mockResolvedValue(null);

      await expect(service.approveLeave(999, {}, 100)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── REJECT LEAVE ─────────────────────────────────────

  describe('rejectLeave', () => {
    it('should reject leave with admin remarks', async () => {
      leaveAppRepo.findById.mockResolvedValue({
        id: 1,
        status: LeaveStatusEnum.pending,
      });
      leaveAppRepo.update.mockResolvedValue({
        id: 1,
        status: LeaveStatusEnum.rejected,
        adminRemarks: 'Not approved',
      });

      const result = await service.rejectLeave(1, {
        adminRemarks: 'Not approved',
      });

      expect(leaveAppRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          status: LeaveStatusEnum.rejected,
          adminRemarks: 'Not approved',
        }),
      );
      expect(result.status).toBe(LeaveStatusEnum.rejected);
    });

    it('should throw NotFoundException for non-existent leave', async () => {
      leaveAppRepo.findById.mockResolvedValue(null);

      await expect(service.rejectLeave(999, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
