import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { TimetablesService } from '../timetables.service';
import { TimetableRepository } from '../infrastructure/persistence/timetable.repository';
import { PeriodRepository } from '../infrastructure/persistence/period.repository';
import { StaffBranchAssignmentRepository } from '../../staff-management/infrastructure/persistence/staff-branch-assignment.repository';
import { TenantContextService } from '../../tenant/tenant-context/tenant-context.service';

function createMockTimetableRepo() {
  return {
    create: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    findByBranch: jest.fn().mockResolvedValue([]),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

function createMockPeriodRepo() {
  return {
    create: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    findByTimetable: jest.fn().mockResolvedValue([]),
    findConflicts: jest.fn().mockResolvedValue([]),
    findRoomConflicts: jest.fn().mockResolvedValue([]),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

function createMockStaffBranchRepo() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByStaffId: jest.fn(),
    findByStaffAndBranch: jest.fn(),
    updatePrimaryFlag: jest.fn(),
    findByUserAndTenant: jest.fn().mockResolvedValue([]),
  };
}

function createMockTenantContext() {
  return {
    getTenantId: jest.fn().mockReturnValue('tenant-uuid-1'),
    getBranchId: jest.fn().mockReturnValue('branch-uuid-1'),
    hasContext: jest.fn().mockReturnValue(true),
  };
}

describe('TimetablesService', () => {
  let service: TimetablesService;
  let timetableRepo: ReturnType<typeof createMockTimetableRepo>;
  let periodRepo: ReturnType<typeof createMockPeriodRepo>;
  let staffBranchRepo: ReturnType<typeof createMockStaffBranchRepo>;
  let tenantContext: ReturnType<typeof createMockTenantContext>;

  const mockTimetable = {
    id: 'tt-uuid-1',
    tenantId: 'tenant-uuid-1',
    branchId: 'branch-uuid-1',
    classId: 1,
    academicYearId: 1,
    name: 'Class 10-A Timetable',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPeriod = {
    id: 'period-uuid-1',
    tenantId: 'tenant-uuid-1',
    branchId: 'branch-uuid-1',
    timetableId: 'tt-uuid-1',
    subjectId: 1,
    teacherId: 10,
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '08:45',
    room: 'Room 101',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    timetableRepo = createMockTimetableRepo();
    periodRepo = createMockPeriodRepo();
    staffBranchRepo = createMockStaffBranchRepo();
    tenantContext = createMockTenantContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimetablesService,
        { provide: TimetableRepository, useValue: timetableRepo },
        { provide: PeriodRepository, useValue: periodRepo },
        {
          provide: StaffBranchAssignmentRepository,
          useValue: staffBranchRepo,
        },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<TimetablesService>(TimetablesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Timetable CRUD ──────────────────────────────────

  describe('create', () => {
    it('should create a timetable with tenant context', async () => {
      timetableRepo.create.mockResolvedValue(mockTimetable);
      const result = await service.create({
        tenantId: 'tenant-uuid-1',
        branchId: 'branch-uuid-1',
        classId: 1,
        academicYearId: 1,
        name: 'Class 10-A Timetable',
      });
      expect(result).toEqual(mockTimetable);
      expect(timetableRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-uuid-1',
          branchId: 'branch-uuid-1',
          classId: 1,
        }),
      );
    });

    it('should default isActive to true', async () => {
      timetableRepo.create.mockResolvedValue(mockTimetable);
      await service.create({
        tenantId: 'tenant-uuid-1',
        branchId: 'branch-uuid-1',
        classId: 1,
        academicYearId: 1,
      });
      expect(timetableRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all timetables for tenant', async () => {
      timetableRepo.findAll.mockResolvedValue([mockTimetable]);
      const result = await service.findAll();
      expect(result).toEqual([mockTimetable]);
    });
  });

  describe('findOne', () => {
    it('should return a timetable by id', async () => {
      timetableRepo.findById.mockResolvedValue(mockTimetable);
      const result = await service.findOne('tt-uuid-1');
      expect(result).toEqual(mockTimetable);
    });

    it('should throw NotFoundException if not found', async () => {
      timetableRepo.findById.mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByBranch', () => {
    it('should return timetables for a branch', async () => {
      timetableRepo.findByBranch.mockResolvedValue([mockTimetable]);
      const result = await service.findByBranch('branch-uuid-1');
      expect(result).toEqual([mockTimetable]);
    });
  });

  describe('update', () => {
    it('should update a timetable', async () => {
      timetableRepo.findById.mockResolvedValue(mockTimetable);
      const updated = { ...mockTimetable, name: 'Updated Name' };
      timetableRepo.update.mockResolvedValue(updated);
      const result = await service.update('tt-uuid-1', {
        name: 'Updated Name',
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException if timetable does not exist', async () => {
      timetableRepo.findById.mockResolvedValue(null);
      await expect(
        service.update('non-existent', { name: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a timetable', async () => {
      timetableRepo.findById.mockResolvedValue(mockTimetable);
      timetableRepo.remove.mockResolvedValue(undefined);
      await expect(service.remove('tt-uuid-1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if timetable does not exist', async () => {
      timetableRepo.findById.mockResolvedValue(null);
      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── Period Management ────────────────────────────────

  describe('addPeriod', () => {
    const addPeriodDto = {
      timetableId: 'tt-uuid-1',
      subjectId: 1,
      teacherId: 10,
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '08:45',
      room: 'Room 101',
    };

    it('should add a period when teacher is assigned to branch', async () => {
      timetableRepo.findById.mockResolvedValue(mockTimetable);
      staffBranchRepo.findByUserAndTenant.mockResolvedValue([
        { branchId: 'branch-uuid-1' },
      ]);
      periodRepo.findConflicts.mockResolvedValue([]);
      periodRepo.findRoomConflicts.mockResolvedValue([]);
      periodRepo.create.mockResolvedValue(mockPeriod);

      const result = await service.addPeriod(addPeriodDto);
      expect(result).toEqual(mockPeriod);
    });

    it('should throw BadRequestException if teacher not assigned to branch', async () => {
      timetableRepo.findById.mockResolvedValue(mockTimetable);
      staffBranchRepo.findByUserAndTenant.mockResolvedValue([
        { branchId: 'other-branch-uuid' },
      ]);

      await expect(service.addPeriod(addPeriodDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException on teacher time conflict', async () => {
      timetableRepo.findById.mockResolvedValue(mockTimetable);
      staffBranchRepo.findByUserAndTenant.mockResolvedValue([
        { branchId: 'branch-uuid-1' },
      ]);
      periodRepo.findConflicts.mockResolvedValue([mockPeriod]);

      await expect(service.addPeriod(addPeriodDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException on room conflict within branch', async () => {
      timetableRepo.findById.mockResolvedValue(mockTimetable);
      staffBranchRepo.findByUserAndTenant.mockResolvedValue([
        { branchId: 'branch-uuid-1' },
      ]);
      periodRepo.findConflicts.mockResolvedValue([]);
      periodRepo.findRoomConflicts.mockResolvedValue([mockPeriod]);

      await expect(service.addPeriod(addPeriodDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should skip room conflict check when no room provided', async () => {
      timetableRepo.findById.mockResolvedValue(mockTimetable);
      staffBranchRepo.findByUserAndTenant.mockResolvedValue([
        { branchId: 'branch-uuid-1' },
      ]);
      periodRepo.findConflicts.mockResolvedValue([]);
      periodRepo.create.mockResolvedValue({ ...mockPeriod, room: null });

      const result = await service.addPeriod({
        ...addPeriodDto,
        room: undefined,
      });
      expect(result).toBeDefined();
      expect(periodRepo.findRoomConflicts).not.toHaveBeenCalled();
    });
  });

  describe('findPeriodsByTimetable', () => {
    it('should return periods for a timetable', async () => {
      timetableRepo.findById.mockResolvedValue(mockTimetable);
      periodRepo.findByTimetable.mockResolvedValue([mockPeriod]);
      const result = await service.findPeriodsByTimetable('tt-uuid-1');
      expect(result).toEqual([mockPeriod]);
    });
  });

  describe('removePeriod', () => {
    it('should remove a period', async () => {
      periodRepo.findById.mockResolvedValue(mockPeriod);
      periodRepo.remove.mockResolvedValue(undefined);
      await expect(
        service.removePeriod('period-uuid-1'),
      ).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if period does not exist', async () => {
      periodRepo.findById.mockResolvedValue(null);
      await expect(service.removePeriod('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('checkConflicts', () => {
    it('should return conflicting periods', async () => {
      periodRepo.findConflicts.mockResolvedValue([mockPeriod]);
      const result = await service.checkConflicts(
        10,
        1,
        '08:00',
        '08:45',
      );
      expect(result).toEqual([mockPeriod]);
    });

    it('should return empty array when no conflicts', async () => {
      periodRepo.findConflicts.mockResolvedValue([]);
      const result = await service.checkConflicts(
        10,
        1,
        '10:00',
        '10:45',
      );
      expect(result).toEqual([]);
    });
  });
});
