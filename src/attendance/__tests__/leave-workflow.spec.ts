import { LeaveManagementService } from '../leave-management.service';
import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  LeaveStatusEnum,
  LeaveTypeEnum,
} from '../../lms/common/enums/leave-status.enum';
import { AttendanceStatusEnum } from '../../lms/common/enums/attendance-status.enum';

describe('LeaveManagementService', () => {
  let service: LeaveManagementService;
  let leaveRequestRepo: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
  };
  let staffLeaveRepo: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
  };
  let studentAttendanceRepo: {
    create: jest.Mock;
    findAll: jest.Mock;
    update: jest.Mock;
  };
  let staffAttendanceRepo: {
    create: jest.Mock;
    findAll: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(() => {
    leaveRequestRepo = {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      update: jest.fn(),
    };
    staffLeaveRepo = {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      update: jest.fn(),
    };
    studentAttendanceRepo = {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
    };
    staffAttendanceRepo = {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
    };

    service = new LeaveManagementService(
      leaveRequestRepo as any,
      staffLeaveRepo as any,
      studentAttendanceRepo as any,
      staffAttendanceRepo as any,
    );
  });

  // ─── Leave Approval Workflow ──────────────────────────
  describe('approveLeave', () => {
    it('should transition leave from pending to approved', async () => {
      leaveRequestRepo.findById.mockResolvedValue({
        id: 1,
        studentId: 5,
        fromDate: new Date('2025-12-10'),
        toDate: new Date('2025-12-12'),
        status: LeaveStatusEnum.pending,
      });
      leaveRequestRepo.update.mockResolvedValue({
        id: 1,
        status: LeaveStatusEnum.approved,
        adminRemarks: 'OK',
        approvedById: 1,
      });

      const result = await service.approveLeave(1, 'student', {
        adminRemarks: 'OK',
        approvedById: 1,
      });

      expect(result!.status).toBe(LeaveStatusEnum.approved);
      expect(leaveRequestRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: LeaveStatusEnum.approved }),
      );
    });

    it('should throw NotFoundException for invalid leave ID', async () => {
      leaveRequestRepo.findById.mockResolvedValue(null);

      await expect(
        service.approveLeave(999, 'student', {
          adminRemarks: 'X',
          approvedById: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for non-pending leave', async () => {
      leaveRequestRepo.findById.mockResolvedValue({
        id: 1,
        status: LeaveStatusEnum.approved,
      });

      await expect(
        service.approveLeave(1, 'student', {
          adminRemarks: 'X',
          approvedById: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── Retroactive Attendance Updates ───────────────────
  describe('retroactiveAttendanceUpdate', () => {
    it('should mark attendance as excused for approved leave dates', async () => {
      studentAttendanceRepo.findAll.mockResolvedValue([
        {
          id: 10,
          studentId: 5,
          date: new Date('2025-12-10'),
          status: AttendanceStatusEnum.absent,
        },
        {
          id: 11,
          studentId: 5,
          date: new Date('2025-12-11'),
          status: AttendanceStatusEnum.absent,
        },
      ]);

      await service.updateAttendanceForApprovedLeave('student', {
        attendableId: 5,
        fromDate: new Date('2025-12-10'),
        toDate: new Date('2025-12-12'),
      });

      expect(studentAttendanceRepo.update).toHaveBeenCalledTimes(2);
      expect(studentAttendanceRepo.update).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ status: AttendanceStatusEnum.excused }),
      );
    });

    it('should create excused records for dates without attendance', async () => {
      studentAttendanceRepo.findAll.mockResolvedValue([]);

      await service.updateAttendanceForApprovedLeave('student', {
        attendableId: 5,
        fromDate: new Date('2025-12-10'),
        toDate: new Date('2025-12-12'),
      });

      // Should create records for 10th, 11th, 12th
      expect(studentAttendanceRepo.create).toHaveBeenCalledTimes(3);
    });
  });

  // ─── Leave Rejection ──────────────────────────────────
  describe('rejectLeave', () => {
    it('should transition leave from pending to rejected', async () => {
      leaveRequestRepo.findById.mockResolvedValue({
        id: 1,
        status: LeaveStatusEnum.pending,
      });
      leaveRequestRepo.update.mockResolvedValue({
        id: 1,
        status: LeaveStatusEnum.rejected,
        adminRemarks: 'Reason',
      });

      const result = await service.rejectLeave(1, 'student', {
        adminRemarks: 'Reason',
      });

      expect(result!.status).toBe(LeaveStatusEnum.rejected);
    });

    it('should not reject already-processed leave', async () => {
      leaveRequestRepo.findById.mockResolvedValue({
        id: 1,
        status: LeaveStatusEnum.rejected,
      });

      await expect(
        service.rejectLeave(1, 'student', { adminRemarks: 'X' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── Overlap Detection ────────────────────────────────
  describe('checkOverlap', () => {
    it('should detect overlapping student leave', async () => {
      leaveRequestRepo.findAll.mockResolvedValue([
        {
          id: 1,
          studentId: 5,
          fromDate: new Date('2025-12-10'),
          toDate: new Date('2025-12-15'),
          status: LeaveStatusEnum.pending,
        },
      ]);

      await expect(
        service.applyLeave({
          attendableType: 'student',
          attendableId: 5,
          fromDate: '2025-12-12',
          toDate: '2025-12-18',
          reason: 'Overlap',
          leaveType: LeaveTypeEnum.casual,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow non-overlapping leave', async () => {
      leaveRequestRepo.findAll.mockResolvedValue([
        {
          id: 1,
          studentId: 5,
          fromDate: new Date('2025-12-10'),
          toDate: new Date('2025-12-12'),
          status: LeaveStatusEnum.pending,
        },
      ]);
      leaveRequestRepo.create.mockResolvedValue({
        id: 2,
        studentId: 5,
        fromDate: new Date('2025-12-15'),
        toDate: new Date('2025-12-17'),
        status: LeaveStatusEnum.pending,
      });

      const result = await service.applyLeave({
        attendableType: 'student',
        attendableId: 5,
        fromDate: '2025-12-15',
        toDate: '2025-12-17',
        reason: 'No overlap',
        leaveType: LeaveTypeEnum.casual,
      });

      expect(result).toHaveProperty('id');
    });
  });

  // ─── Date Validation ──────────────────────────────────
  describe('date validation', () => {
    it('should reject fromDate > toDate', async () => {
      await expect(
        service.applyLeave({
          attendableType: 'student',
          attendableId: 1,
          fromDate: '2025-12-20',
          toDate: '2025-12-10',
          reason: 'Invalid range',
          leaveType: LeaveTypeEnum.casual,
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });
});
