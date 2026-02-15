import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffRepository } from './infrastructure/persistence/staff.repository';
import { StaffAttendanceRepository } from './infrastructure/persistence/staff-attendance.repository';
import { StaffLeaveRepository } from './infrastructure/persistence/staff-leave.repository';
import { NoticeRepository } from './infrastructure/persistence/notice.repository';
import { TimetableSlotRepository } from './infrastructure/persistence/timetable-slot.repository';
import { SalarySlipRepository } from './infrastructure/persistence/salary-slip.repository';

function createMockRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

describe('StaffService', () => {
  let service: StaffService;
  let staffRepo: ReturnType<typeof createMockRepository>;
  let staffAttendanceRepo: ReturnType<typeof createMockRepository>;
  let staffLeaveRepo: ReturnType<typeof createMockRepository>;
  let noticeRepo: ReturnType<typeof createMockRepository>;
  let timetableSlotRepo: ReturnType<typeof createMockRepository>;
  let salarySlipRepo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    staffRepo = createMockRepository();
    staffAttendanceRepo = createMockRepository();
    staffLeaveRepo = createMockRepository();
    noticeRepo = createMockRepository();
    timetableSlotRepo = createMockRepository();
    salarySlipRepo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        { provide: StaffRepository, useValue: staffRepo },
        { provide: StaffAttendanceRepository, useValue: staffAttendanceRepo },
        { provide: StaffLeaveRepository, useValue: staffLeaveRepo },
        { provide: NoticeRepository, useValue: noticeRepo },
        { provide: TimetableSlotRepository, useValue: timetableSlotRepo },
        { provide: SalarySlipRepository, useValue: salarySlipRepo },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Helper for standard CRUD tests
  function describeCrudEntity(
    entityName: string,
    mockEntity: Record<string, any>,
    getRepo: () => ReturnType<typeof createMockRepository>,
    methods: {
      create: (dto: any) => Promise<any>;
      findAll: () => Promise<any>;
      findOne: (id: number) => Promise<any>;
      update: (id: number, dto: any) => Promise<any>;
      remove: (id: number) => Promise<any>;
    },
  ) {
    describe(entityName, () => {
      describe('create', () => {
        // eslint-disable-next-line no-restricted-syntax
        it(`should create a ${entityName.toLowerCase()}`, async () => {
          getRepo().create.mockResolvedValue(mockEntity);
          const result = await methods.create(mockEntity);
          expect(result).toEqual(mockEntity);
        });
      });

      describe('findAll', () => {
        // eslint-disable-next-line no-restricted-syntax
        it(`should return all ${entityName.toLowerCase()} records`, async () => {
          getRepo().findAll.mockResolvedValue([mockEntity]);
          expect(await methods.findAll()).toEqual([mockEntity]);
        });
      });

      describe('findOne', () => {
        // eslint-disable-next-line no-restricted-syntax
        it(`should return a ${entityName.toLowerCase()} by id`, async () => {
          getRepo().findById.mockResolvedValue(mockEntity);
          expect(await methods.findOne(1)).toEqual(mockEntity);
        });

        it('should throw NotFoundException if not found', async () => {
          getRepo().findById.mockResolvedValue(null);
          await expect(methods.findOne(999)).rejects.toThrow(NotFoundException);
        });
      });

      describe('update', () => {
        // eslint-disable-next-line no-restricted-syntax
        it(`should update a ${entityName.toLowerCase()}`, async () => {
          getRepo().findById.mockResolvedValue(mockEntity);
          getRepo().update.mockResolvedValue({ ...mockEntity, updated: true });
          const result = await methods.update(1, { updated: true });
          expect(result).toBeDefined();
        });

        it('should throw NotFoundException if not found', async () => {
          getRepo().findById.mockResolvedValue(null);
          await expect(methods.update(999, {})).rejects.toThrow(
            NotFoundException,
          );
        });
      });

      describe('remove', () => {
        // eslint-disable-next-line no-restricted-syntax
        it(`should remove a ${entityName.toLowerCase()}`, async () => {
          getRepo().findById.mockResolvedValue(mockEntity);
          getRepo().remove.mockResolvedValue(undefined);
          await expect(methods.remove(1)).resolves.toBeUndefined();
        });

        it('should throw NotFoundException if not found', async () => {
          getRepo().findById.mockResolvedValue(null);
          await expect(methods.remove(999)).rejects.toThrow(NotFoundException);
        });
      });
    });
  }

  // ─── Staff ────────────────────────────────────────────
  describeCrudEntity(
    'Staff',
    { id: 1, employeeId: 'EMP-001' },
    () => staffRepo,
    {
      create: (dto) => service.createStaff(dto),
      findAll: () => service.findAllStaff(),
      findOne: (id) => service.findOneStaff(id),
      update: (id, dto) => service.updateStaff(id, dto),
      remove: (id) => service.removeStaff(id),
    },
  );

  // ─── Staff Attendance ─────────────────────────────────
  describeCrudEntity(
    'StaffAttendance',
    { id: 1, status: 'present' },
    () => staffAttendanceRepo,
    {
      create: (dto) => service.createStaffAttendance(dto),
      findAll: () => service.findAllStaffAttendances(),
      findOne: (id) => service.findOneStaffAttendance(id),
      update: (id, dto) => service.updateStaffAttendance(id, dto),
      remove: (id) => service.removeStaffAttendance(id),
    },
  );

  // ─── Staff Leave ──────────────────────────────────────
  describeCrudEntity(
    'StaffLeave',
    { id: 1, leaveType: 'sick' },
    () => staffLeaveRepo,
    {
      create: (dto) => service.createStaffLeave(dto),
      findAll: () => service.findAllStaffLeaves(),
      findOne: (id) => service.findOneStaffLeave(id),
      update: (id, dto) => service.updateStaffLeave(id, dto),
      remove: (id) => service.removeStaffLeave(id),
    },
  );

  // ─── Notice ───────────────────────────────────────────
  describeCrudEntity(
    'Notice',
    { id: 1, title: 'Holiday Notice' },
    () => noticeRepo,
    {
      create: (dto) => service.createNotice(dto),
      findAll: () => service.findAllNotices(),
      findOne: (id) => service.findOneNotice(id),
      update: (id, dto) => service.updateNotice(id, dto),
      remove: (id) => service.removeNotice(id),
    },
  );

  // ─── Timetable Slot ──────────────────────────────────
  describeCrudEntity(
    'TimetableSlot',
    { id: 1, dayOfWeek: 'monday' },
    () => timetableSlotRepo,
    {
      create: (dto) => service.createTimetableSlot(dto),
      findAll: () => service.findAllTimetableSlots(),
      findOne: (id) => service.findOneTimetableSlot(id),
      update: (id, dto) => service.updateTimetableSlot(id, dto),
      remove: (id) => service.removeTimetableSlot(id),
    },
  );

  // ─── Salary Slip ─────────────────────────────────────
  describeCrudEntity(
    'SalarySlip',
    { id: 1, month: 'January', year: 2026 },
    () => salarySlipRepo,
    {
      create: (dto) => service.createSalarySlip(dto),
      findAll: () => service.findAllSalarySlips(),
      findOne: (id) => service.findOneSalarySlip(id),
      update: (id, dto) => service.updateSalarySlip(id, dto),
      remove: (id) => service.removeSalarySlip(id),
    },
  );
});
