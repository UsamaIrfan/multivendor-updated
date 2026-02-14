import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from '../attendance.service';
import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AttendanceStatusEnum } from '../../lms/common/enums/attendance-status.enum';
import {
  LeaveStatusEnum,
  LeaveTypeEnum,
} from '../../lms/common/enums/leave-status.enum';
import { StudentAttendanceRepository } from '../../lms/student/infrastructure/persistence/student-attendance.repository';
import { StaffAttendanceRepository } from '../../lms/staff/infrastructure/persistence/staff-attendance.repository';
import { LeaveRequestRepository } from '../../lms/student/infrastructure/persistence/leave-request.repository';
import { StaffLeaveRepository } from '../../lms/staff/infrastructure/persistence/staff-leave.repository';
import { StudentRepository } from '../../lms/student/infrastructure/persistence/student.repository';
import { StaffRepository } from '../../lms/staff/infrastructure/persistence/staff.repository';
import { AttendanceCalculatorService } from '../attendance-calculator.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let studentAttendanceRepo: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };
  let staffAttendanceRepo: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };
  let leaveRequestRepo: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };
  let staffLeaveRepo: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };
  let studentRepo: { findAll: jest.Mock; findById: jest.Mock };
  let staffRepo: { findAll: jest.Mock; findById: jest.Mock };
  let attendanceCalculator: {
    calculatePercentage: jest.Mock;
    calculateSummary: jest.Mock;
  };

  beforeEach(async () => {
    studentAttendanceRepo = {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    staffAttendanceRepo = {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    leaveRequestRepo = {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    staffLeaveRepo = {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    studentRepo = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
    };
    staffRepo = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
    };
    attendanceCalculator = {
      calculatePercentage: jest.fn(),
      calculateSummary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: StudentAttendanceRepository,
          useValue: studentAttendanceRepo,
        },
        {
          provide: StaffAttendanceRepository,
          useValue: staffAttendanceRepo,
        },
        { provide: LeaveRequestRepository, useValue: leaveRequestRepo },
        { provide: StaffLeaveRepository, useValue: staffLeaveRepo },
        { provide: StudentRepository, useValue: studentRepo },
        { provide: StaffRepository, useValue: staffRepo },
        {
          provide: AttendanceCalculatorService,
          useValue: attendanceCalculator,
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  // ─── markAttendance ───────────────────────────────────
  describe('markAttendance', () => {
    it('should create a student attendance record', async () => {
      const dto = {
        attendableType: 'student' as const,
        attendableId: 1,
        date: '2025-12-01',
        status: AttendanceStatusEnum.present,
      };
      studentAttendanceRepo.create.mockResolvedValue({
        id: 1,
        studentId: 1,
        date: new Date('2025-12-01'),
        status: AttendanceStatusEnum.present,
      });

      const result = await service.markAttendance(dto);

      expect(result).toHaveProperty('id');
      expect(studentAttendanceRepo.create).toHaveBeenCalled();
    });

    it('should create a staff attendance record with check-in/check-out', async () => {
      const dto = {
        attendableType: 'staff' as const,
        attendableId: 1,
        date: '2025-12-01',
        status: AttendanceStatusEnum.present,
        checkIn: '08:00',
        checkOut: '16:00',
      };
      staffAttendanceRepo.create.mockResolvedValue({
        id: 1,
        staffId: 1,
        date: new Date('2025-12-01'),
        status: AttendanceStatusEnum.present,
        checkIn: '08:00',
        checkOut: '16:00',
      });

      const result = await service.markAttendance(dto);

      expect(result).toHaveProperty('id');
      expect((result as any).checkIn).toBe('08:00');
      expect(staffAttendanceRepo.create).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate attendance', async () => {
      const dto = {
        attendableType: 'student' as const,
        attendableId: 1,
        date: '2025-12-01',
        status: AttendanceStatusEnum.present,
      };
      studentAttendanceRepo.findAll.mockResolvedValue([
        { id: 1, studentId: 1, date: new Date('2025-12-01') },
      ]);

      await expect(service.markAttendance(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw UnprocessableEntityException for future dates', async () => {
      const dto = {
        attendableType: 'student' as const,
        attendableId: 1,
        date: '2099-12-01',
        status: AttendanceStatusEnum.present,
      };

      await expect(service.markAttendance(dto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw UnprocessableEntityException for invalid status', async () => {
      const dto = {
        attendableType: 'student' as const,
        attendableId: 1,
        date: '2025-12-01',
        status: 'INVALID' as any,
      };

      await expect(service.markAttendance(dto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  // ─── bulkMarkAttendance ───────────────────────────────
  describe('bulkMarkAttendance', () => {
    it('should mark attendance for multiple students', async () => {
      studentAttendanceRepo.create.mockResolvedValue({ id: 1 });

      const result = await service.bulkMarkAttendance({
        date: '2025-12-01',
        sectionId: 1,
        records: [
          {
            attendableType: 'student',
            attendableId: 1,
            status: AttendanceStatusEnum.present,
          },
          {
            attendableType: 'student',
            attendableId: 2,
            status: AttendanceStatusEnum.absent,
          },
        ],
      });

      expect(result.marked).toBe(2);
      expect(studentAttendanceRepo.create).toHaveBeenCalledTimes(2);
    });

    it('should throw UnprocessableEntityException for future dates', async () => {
      await expect(
        service.bulkMarkAttendance({
          date: '2099-06-01',
          sectionId: 1,
          records: [],
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should skip duplicates and report them', async () => {
      studentAttendanceRepo.findAll.mockResolvedValue([
        { id: 99, studentId: 1, date: new Date('2025-12-01') },
      ]);
      studentAttendanceRepo.create.mockResolvedValue({ id: 2 });

      const result = await service.bulkMarkAttendance({
        date: '2025-12-01',
        sectionId: 1,
        records: [
          {
            attendableType: 'student',
            attendableId: 1,
            status: AttendanceStatusEnum.present,
          },
          {
            attendableType: 'student',
            attendableId: 2,
            status: AttendanceStatusEnum.absent,
          },
        ],
      });

      expect(result.marked).toBe(1);
      expect(result.skipped).toBe(1);
    });
  });

  // ─── getAttendanceByDateRange ─────────────────────────
  describe('getAttendanceByDateRange', () => {
    it('should return filtered and paginated attendance records', async () => {
      studentAttendanceRepo.findAll.mockResolvedValue([
        {
          id: 1,
          studentId: 1,
          date: new Date('2025-12-01'),
          status: AttendanceStatusEnum.present,
        },
        {
          id: 2,
          studentId: 1,
          date: new Date('2025-12-02'),
          status: AttendanceStatusEnum.absent,
        },
      ]);

      const result = await service.getAttendance({
        startDate: '2025-12-01',
        endDate: '2025-12-31',
        attendableType: 'student',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result).toHaveProperty('hasNextPage');
    });

    it('should filter by status', async () => {
      studentAttendanceRepo.findAll.mockResolvedValue([
        {
          id: 1,
          studentId: 1,
          date: new Date('2025-12-01'),
          status: AttendanceStatusEnum.present,
        },
        {
          id: 2,
          studentId: 1,
          date: new Date('2025-12-02'),
          status: AttendanceStatusEnum.absent,
        },
      ]);

      const result = await service.getAttendance({
        status: AttendanceStatusEnum.present,
        attendableType: 'student',
      });

      expect(
        result.data.every(
          (r: any) => r.status === AttendanceStatusEnum.present,
        ),
      ).toBe(true);
    });

    it('should return empty array when no records match', async () => {
      studentAttendanceRepo.findAll.mockResolvedValue([]);
      staffAttendanceRepo.findAll.mockResolvedValue([]);

      const result = await service.getAttendance({
        startDate: '2099-01-01',
        endDate: '2099-12-31',
      });

      expect(result.data).toHaveLength(0);
    });
  });

  // ─── applyLeave ───────────────────────────────────────
  describe('applyLeave', () => {
    it('should create a student leave request', async () => {
      leaveRequestRepo.create.mockResolvedValue({
        id: 1,
        studentId: 1,
        fromDate: new Date('2025-12-10'),
        toDate: new Date('2025-12-12'),
        reason: 'Family event',
        status: LeaveStatusEnum.pending,
      });

      const result = await service.applyLeave({
        attendableType: 'student',
        attendableId: 1,
        fromDate: '2025-12-10',
        toDate: '2025-12-12',
        reason: 'Family event',
        leaveType: LeaveTypeEnum.casual,
      });

      expect(result).toHaveProperty('id');
      expect(result.status).toBe(LeaveStatusEnum.pending);
    });

    it('should create a staff leave request', async () => {
      staffLeaveRepo.create.mockResolvedValue({
        id: 1,
        staffId: 1,
        fromDate: new Date('2025-12-15'),
        toDate: new Date('2025-12-16'),
        reason: 'Medical',
        leaveType: LeaveTypeEnum.sick,
        status: LeaveStatusEnum.pending,
      });

      const result = await service.applyLeave({
        attendableType: 'staff',
        attendableId: 1,
        fromDate: '2025-12-15',
        toDate: '2025-12-16',
        reason: 'Medical',
        leaveType: LeaveTypeEnum.sick,
      });

      expect(result).toHaveProperty('id');
      expect(result.status).toBe(LeaveStatusEnum.pending);
    });

    it('should throw UnprocessableEntityException when fromDate > toDate', async () => {
      await expect(
        service.applyLeave({
          attendableType: 'student',
          attendableId: 1,
          fromDate: '2025-12-15',
          toDate: '2025-12-10',
          reason: 'Bad range',
          leaveType: LeaveTypeEnum.casual,
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw ConflictException for overlapping leaves', async () => {
      leaveRequestRepo.findAll.mockResolvedValue([
        {
          id: 1,
          studentId: 1,
          fromDate: new Date('2025-12-10'),
          toDate: new Date('2025-12-12'),
          status: LeaveStatusEnum.pending,
        },
      ]);

      await expect(
        service.applyLeave({
          attendableType: 'student',
          attendableId: 1,
          fromDate: '2025-12-11',
          toDate: '2025-12-14',
          reason: 'Overlap',
          leaveType: LeaveTypeEnum.casual,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw UnprocessableEntityException for invalid leaveType', async () => {
      await expect(
        service.applyLeave({
          attendableType: 'student',
          attendableId: 1,
          fromDate: '2025-12-25',
          toDate: '2025-12-26',
          reason: 'Bad type',
          leaveType: 'INVALID' as any,
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  // ─── approveLeave ─────────────────────────────────────
  describe('approveLeave', () => {
    it('should approve a pending student leave', async () => {
      leaveRequestRepo.findById.mockResolvedValue({
        id: 1,
        studentId: 1,
        fromDate: new Date('2025-12-10'),
        toDate: new Date('2025-12-12'),
        status: LeaveStatusEnum.pending,
      });
      leaveRequestRepo.update.mockResolvedValue({
        id: 1,
        status: LeaveStatusEnum.approved,
        adminRemarks: 'OK',
      });

      const result = await service.approveLeave(1, 'student', {
        adminRemarks: 'OK',
        approvedById: 1,
      });

      expect(result!.status).toBe(LeaveStatusEnum.approved);
    });

    it('should throw ConflictException for already-processed leave', async () => {
      leaveRequestRepo.findById.mockResolvedValue({
        id: 1,
        status: LeaveStatusEnum.approved,
      });

      await expect(
        service.approveLeave(1, 'student', {
          adminRemarks: 'Again',
          approvedById: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException for non-existent leave', async () => {
      leaveRequestRepo.findById.mockResolvedValue(null);

      await expect(
        service.approveLeave(999, 'student', {
          adminRemarks: 'Missing',
          approvedById: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── rejectLeave ──────────────────────────────────────
  describe('rejectLeave', () => {
    it('should reject a pending leave with reason', async () => {
      leaveRequestRepo.findById.mockResolvedValue({
        id: 1,
        status: LeaveStatusEnum.pending,
      });
      leaveRequestRepo.update.mockResolvedValue({
        id: 1,
        status: LeaveStatusEnum.rejected,
        adminRemarks: 'Insufficient coverage',
      });

      const result = await service.rejectLeave(1, 'student', {
        adminRemarks: 'Insufficient coverage',
      });

      expect(result!.status).toBe(LeaveStatusEnum.rejected);
      expect(result!.adminRemarks).toBe('Insufficient coverage');
    });

    it('should throw ConflictException for already-processed leave', async () => {
      leaveRequestRepo.findById.mockResolvedValue({
        id: 1,
        status: LeaveStatusEnum.rejected,
      });

      await expect(
        service.rejectLeave(1, 'student', { adminRemarks: 'Too late' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── generateLowAttendanceAlerts ──────────────────────
  describe('generateLowAttendanceAlerts', () => {
    it('should return students below threshold', async () => {
      studentRepo.findAll.mockResolvedValue([
        { id: 1, rollNumber: 'STU-001' },
        { id: 2, rollNumber: 'STU-002' },
      ]);
      studentAttendanceRepo.findAll.mockResolvedValue([
        {
          id: 1,
          studentId: 1,
          date: new Date('2025-12-01'),
          status: AttendanceStatusEnum.present,
        },
        {
          id: 2,
          studentId: 1,
          date: new Date('2025-12-02'),
          status: AttendanceStatusEnum.absent,
        },
        {
          id: 3,
          studentId: 1,
          date: new Date('2025-12-03'),
          status: AttendanceStatusEnum.absent,
        },
        {
          id: 4,
          studentId: 1,
          date: new Date('2025-12-04'),
          status: AttendanceStatusEnum.absent,
        },
        {
          id: 5,
          studentId: 2,
          date: new Date('2025-12-01'),
          status: AttendanceStatusEnum.present,
        },
      ]);

      // Student 1: 1/4 = 25%, Student 2: 1/1 = 100%
      attendanceCalculator.calculatePercentage
        .mockReturnValueOnce(25)
        .mockReturnValueOnce(100);

      const alerts = await service.getAlerts({
        threshold: 75,
        attendableType: 'student',
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      // student 1 = 25% (1/4), student 2 = 100% (1/1)
      expect(alerts.length).toBeGreaterThanOrEqual(1);
      expect(alerts.some((a: any) => a.attendableId === 1)).toBe(true);
    });

    it('should return empty when everyone is above threshold', async () => {
      studentRepo.findAll.mockResolvedValue([{ id: 1 }]);
      studentAttendanceRepo.findAll.mockResolvedValue([
        {
          id: 1,
          studentId: 1,
          date: new Date('2025-12-01'),
          status: AttendanceStatusEnum.present,
        },
      ]);

      attendanceCalculator.calculatePercentage.mockReturnValue(100);

      const alerts = await service.getAlerts({
        threshold: 75,
        attendableType: 'student',
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(alerts).toHaveLength(0);
    });
  });

  // ─── getDetailedReport ────────────────────────────────
  describe('getDetailedReport', () => {
    it('should return records, summary, and leaves for a student', async () => {
      studentAttendanceRepo.findAll.mockResolvedValue([
        {
          id: 1,
          studentId: 1,
          date: new Date('2025-12-01'),
          status: AttendanceStatusEnum.present,
        },
      ]);
      leaveRequestRepo.findAll.mockResolvedValue([
        {
          id: 1,
          studentId: 1,
          fromDate: new Date('2025-12-10'),
          toDate: new Date('2025-12-12'),
          status: LeaveStatusEnum.approved,
        },
      ]);

      const report = await service.getDetailedReport({
        attendableType: 'student',
        attendableId: 1,
        startDate: '2025-12-01',
        endDate: '2025-12-31',
      });

      expect(report).toHaveProperty('records');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('leaves');
      expect(Array.isArray(report.records)).toBe(true);
    });
  });
});
