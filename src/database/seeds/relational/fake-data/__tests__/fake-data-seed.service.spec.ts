// ── Mock bcryptjs (avoid real hashing in tests) ──
// @faker-js/faker is mocked via moduleNameMapper in Jest config (ESM-only package)
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('fakesalt'),
  hash: jest.fn().mockResolvedValue('fakehashedpassword'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { FakeDataSeedService } from '../fake-data-seed.service';

// ── Entity imports (needed to verify getRepository calls) ──
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { InstitutionEntity } from '../../../../../lms/courses/infrastructure/persistence/relational/entities/institution.entity';
import { DepartmentEntity } from '../../../../../lms/courses/infrastructure/persistence/relational/entities/department.entity';
import { GradeClassEntity } from '../../../../../lms/courses/infrastructure/persistence/relational/entities/grade-class.entity';
import { SectionEntity } from '../../../../../lms/courses/infrastructure/persistence/relational/entities/section.entity';
import { SubjectEntity } from '../../../../../lms/courses/infrastructure/persistence/relational/entities/subject.entity';
import { AcademicYearEntity } from '../../../../../lms/academic/infrastructure/persistence/relational/entities/academic-year.entity';
import { TermEntity } from '../../../../../lms/academic/infrastructure/persistence/relational/entities/term.entity';
import { StudentEntity } from '../../../../../lms/student/infrastructure/persistence/relational/entities/student.entity';
import { StudentEnrollmentEntity } from '../../../../../lms/student/infrastructure/persistence/relational/entities/student-enrollment.entity';
import { StudentAttendanceEntity } from '../../../../../lms/student/infrastructure/persistence/relational/entities/student-attendance.entity';
import { LeaveRequestEntity } from '../../../../../lms/student/infrastructure/persistence/relational/entities/leave-request.entity';
import { FeeStructureEntity } from '../../../../../lms/student/infrastructure/persistence/relational/entities/fee-structure.entity';
import { FeeChallanEntity } from '../../../../../lms/student/infrastructure/persistence/relational/entities/fee-challan.entity';
import { FeePaymentEntity } from '../../../../../lms/student/infrastructure/persistence/relational/entities/fee-payment.entity';
import { ExamEntity } from '../../../../../lms/student/infrastructure/persistence/relational/entities/exam.entity';
import { ExamSubjectEntity } from '../../../../../lms/student/infrastructure/persistence/relational/entities/exam-subject.entity';
import { ExamResultEntity } from '../../../../../lms/student/infrastructure/persistence/relational/entities/exam-result.entity';
import { CourseMaterialEntity } from '../../../../../lms/student/infrastructure/persistence/relational/entities/course-material.entity';
import { AdmissionEnquiryEntity } from '../../../../../lms/student/infrastructure/persistence/relational/entities/admission-enquiry.entity';
import { StaffEntity } from '../../../../../lms/staff/infrastructure/persistence/relational/entities/staff.entity';
import { StaffAttendanceEntity } from '../../../../../lms/staff/infrastructure/persistence/relational/entities/staff-attendance.entity';
import { StaffLeaveEntity } from '../../../../../lms/staff/infrastructure/persistence/relational/entities/staff-leave.entity';
import { SalarySlipEntity } from '../../../../../lms/staff/infrastructure/persistence/relational/entities/salary-slip.entity';
import { NoticeEntity as LmsNoticeEntity } from '../../../../../lms/staff/infrastructure/persistence/relational/entities/notice.entity';
import { TimetableSlotEntity } from '../../../../../lms/staff/infrastructure/persistence/relational/entities/timetable-slot.entity';
import { IncomeEntity } from '../../../../../lms/accounts/infrastructure/persistence/relational/entities/income.entity';
import { ExpenseEntity } from '../../../../../lms/accounts/infrastructure/persistence/relational/entities/expense.entity';
import { StaffMgmtEntity } from '../../../../../staff-management/infrastructure/persistence/relational/entities/staff-mgmt.entity';
import { StaffBranchAssignmentEntity } from '../../../../../staff-management/infrastructure/persistence/relational/entities/staff-branch-assignment.entity';
import { StaffAttendanceRecordEntity } from '../../../../../staff-attendance/infrastructure/persistence/relational/entities/staff-attendance-record.entity';
import { StaffLeaveApplicationEntity } from '../../../../../staff-attendance/infrastructure/persistence/relational/entities/staff-leave-application.entity';
import { StaffLeaveBalanceEntity } from '../../../../../staff-attendance/infrastructure/persistence/relational/entities/staff-leave-balance.entity';
import { SalaryStructureEntity } from '../../../../../payroll/infrastructure/persistence/relational/entities/salary-structure.entity';
import { PayrollSlipEntity } from '../../../../../payroll/infrastructure/persistence/relational/entities/payroll-slip.entity';
import { MaterialEntity } from '../../../../../materials/infrastructure/persistence/relational/entities/material.entity';
import { AssignmentEntity } from '../../../../../materials/infrastructure/persistence/relational/entities/assignment.entity';
import { GradingScaleEntity } from '../../../../../exams/infrastructure/persistence/relational/entities/grading-scale.entity';
import { ConcessionEntity } from '../../../../../fees/infrastructure/persistence/relational/entities/concession.entity';
import { ReceiptEntity } from '../../../../../fees/infrastructure/persistence/relational/entities/receipt.entity';
import { StudentGuardianEntity } from '../../../../../student-registration/infrastructure/persistence/relational/entities/student-guardian.entity';
import { NoticeEntity as StandaloneNoticeEntity } from '../../../../../notices/infrastructure/persistence/relational/entities/notice.entity';
import { BranchIncomeEntity } from '../../../../../income/infrastructure/persistence/relational/entities/branch-income.entity';
import { BranchExpenseEntity } from '../../../../../expenses/infrastructure/persistence/relational/entities/branch-expense.entity';

// ── All entity classes that the seeder should interact with ──
const ALL_ENTITIES = [
  UserEntity,
  InstitutionEntity,
  DepartmentEntity,
  GradeClassEntity,
  SectionEntity,
  SubjectEntity,
  AcademicYearEntity,
  TermEntity,
  StudentEntity,
  StudentEnrollmentEntity,
  StudentAttendanceEntity,
  LeaveRequestEntity,
  FeeStructureEntity,
  FeeChallanEntity,
  FeePaymentEntity,
  ExamEntity,
  ExamSubjectEntity,
  ExamResultEntity,
  CourseMaterialEntity,
  AdmissionEnquiryEntity,
  StaffEntity,
  StaffAttendanceEntity,
  StaffLeaveEntity,
  SalarySlipEntity,
  LmsNoticeEntity,
  TimetableSlotEntity,
  IncomeEntity,
  ExpenseEntity,
  StaffMgmtEntity,
  StaffBranchAssignmentEntity,
  StaffAttendanceRecordEntity,
  StaffLeaveApplicationEntity,
  StaffLeaveBalanceEntity,
  SalaryStructureEntity,
  PayrollSlipEntity,
  MaterialEntity,
  AssignmentEntity,
  GradingScaleEntity,
  ConcessionEntity,
  ReceiptEntity,
  StudentGuardianEntity,
  StandaloneNoticeEntity,
  BranchIncomeEntity,
  BranchExpenseEntity,
];

// ── Helper: create a mock repository with auto-incrementing IDs ──
function createMockRepo() {
  let autoId = 1;
  return {
    count: jest.fn().mockResolvedValue(0),
    create: jest
      .fn()
      .mockImplementation((data: any) => ({ id: autoId++, ...data })),
    save: jest.fn().mockImplementation((data: any) => {
      if (Array.isArray(data)) {
        return Promise.resolve(
          data.map((d: any) => ({ id: d.id ?? autoId++, ...d })),
        );
      }
      return Promise.resolve({ id: data.id ?? autoId++, ...data });
    }),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    findOne: jest.fn().mockResolvedValue(null),
  };
}

describe('FakeDataSeedService', () => {
  let service: FakeDataSeedService;
  let repoMocks: Map<any, ReturnType<typeof createMockRepo>>;
  let mockDataSource: { getRepository: jest.Mock };

  beforeEach(async () => {
    repoMocks = new Map();

    mockDataSource = {
      getRepository: jest.fn().mockImplementation((entity: any) => {
        if (!repoMocks.has(entity)) {
          repoMocks.set(entity, createMockRepo());
        }
        return repoMocks.get(entity);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FakeDataSeedService,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<FakeDataSeedService>(FakeDataSeedService);
  });

  // ─── INSERTION TESTS ──────────────────────────────────────────

  it('should seed all entity types when no data exists', async () => {
    await service.run();

    // Should have requested repositories for many entity types
    expect(mockDataSource.getRepository).toHaveBeenCalled();
    const calledEntities = mockDataSource.getRepository.mock.calls.map(
      (call: any[]) => call[0],
    );

    // Verify at least the core entities were accessed
    expect(calledEntities).toContain(InstitutionEntity);
    expect(calledEntities).toContain(DepartmentEntity);
    expect(calledEntities).toContain(GradeClassEntity);
    expect(calledEntities).toContain(SectionEntity);
    expect(calledEntities).toContain(SubjectEntity);
    expect(calledEntities).toContain(AcademicYearEntity);
    expect(calledEntities).toContain(TermEntity);
    expect(calledEntities).toContain(StudentEntity);
    expect(calledEntities).toContain(StaffEntity);
    expect(calledEntities).toContain(UserEntity);
  });

  it('should skip seeding when fake data already exists', async () => {
    // Institution count returns 1 → data exists
    const instRepo = createMockRepo();
    instRepo.count.mockResolvedValue(1);
    repoMocks.set(InstitutionEntity, instRepo);

    await service.run();

    // save should NOT have been called on institution
    expect(instRepo.save).not.toHaveBeenCalled();
  });

  // ─── ENTITY-SPECIFIC INSERTION TESTS ──────────────────────────

  it('should create institution with code FAKE-SEED', async () => {
    await service.run();

    const repo = repoMocks.get(InstitutionEntity)!;
    expect(repo.save).toHaveBeenCalled();

    const createCalls = repo.create.mock.calls;
    const institutionData = createCalls[0][0];
    expect(institutionData.code).toBe('FAKE-SEED');
    expect(institutionData.name).toBe('Sunrise International Academy');
  });

  it('should create 19 users across all roles', async () => {
    await service.run();

    const repo = repoMocks.get(UserEntity)!;
    // 10 students + 5 teachers + 2 staff + 1 accountant + 1 parent = 19
    expect(repo.save).toHaveBeenCalledTimes(19);
  });

  it('should create 3 departments', async () => {
    await service.run();

    const repo = repoMocks.get(DepartmentEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(3);

    const codes = repo.create.mock.calls.map((c: any[]) => c[0].code);
    expect(codes).toContain('FAKE-SCI');
    expect(codes).toContain('FAKE-ART');
    expect(codes).toContain('FAKE-COM');
  });

  it('should create 4 grade classes', async () => {
    await service.run();

    const repo = repoMocks.get(GradeClassEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(4);

    const names = repo.create.mock.calls.map((c: any[]) => c[0].name);
    expect(names).toContain('Grade 9');
    expect(names).toContain('Grade 12');
  });

  it('should create 8 sections (2 per grade)', async () => {
    await service.run();

    const repo = repoMocks.get(SectionEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(8);
  });

  it('should create 6 subjects', async () => {
    await service.run();

    const repo = repoMocks.get(SubjectEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(6);
  });

  it('should create 1 academic year and 2 terms', async () => {
    await service.run();

    const yearRepo = repoMocks.get(AcademicYearEntity)!;
    expect(yearRepo.save).toHaveBeenCalledTimes(1);
    expect(yearRepo.create.mock.calls[0][0].name).toBe('2025-2026');
    expect(yearRepo.create.mock.calls[0][0].isCurrent).toBe(true);

    const termRepo = repoMocks.get(TermEntity)!;
    expect(termRepo.save).toHaveBeenCalledTimes(2);
  });

  it('should create 10 students with unique roll numbers', async () => {
    await service.run();

    const repo = repoMocks.get(StudentEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(10);

    const rollNumbers = repo.create.mock.calls.map(
      (c: any[]) => c[0].rollNumber,
    );
    const uniqueRolls = new Set(rollNumbers);
    expect(uniqueRolls.size).toBe(10);
    expect(rollNumbers[0]).toBe('FAKE-STD-001');
  });

  it('should create 5 LMS staff with unique employee IDs', async () => {
    await service.run();

    const repo = repoMocks.get(StaffEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(5);

    const employeeIds = repo.create.mock.calls.map(
      (c: any[]) => c[0].employeeId,
    );
    const uniqueIds = new Set(employeeIds);
    expect(uniqueIds.size).toBe(5);
  });

  it('should create 10 student enrollments', async () => {
    await service.run();

    const repo = repoMocks.get(StudentEnrollmentEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(10);
  });

  it('should create 50 student attendance records (5 days × 10 students)', async () => {
    await service.run();

    const repo = repoMocks.get(StudentAttendanceEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(50);
  });

  it('should create 3 student leave requests', async () => {
    await service.run();

    const repo = repoMocks.get(LeaveRequestEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(3);
  });

  it('should create 2 fee structures', async () => {
    await service.run();

    const repo = repoMocks.get(FeeStructureEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(2);
  });

  it('should create 10 fee challans', async () => {
    await service.run();

    const repo = repoMocks.get(FeeChallanEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(10);
  });

  it('should create 5 fee payments for paid challans', async () => {
    await service.run();

    const repo = repoMocks.get(FeePaymentEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(5);
  });

  it('should create 5 receipts', async () => {
    await service.run();

    const repo = repoMocks.get(ReceiptEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(5);
  });

  it('should create 3 concessions', async () => {
    await service.run();

    const repo = repoMocks.get(ConcessionEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(3);
  });

  it('should create 1 grading scale', async () => {
    await service.run();

    const repo = repoMocks.get(GradingScaleEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should create 2 exams', async () => {
    await service.run();

    const repo = repoMocks.get(ExamEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(2);
  });

  it('should create 4 exam subjects', async () => {
    await service.run();

    const repo = repoMocks.get(ExamSubjectEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(4);
  });

  it('should create 40 exam results (4 subjects × 10 students)', async () => {
    await service.run();

    const repo = repoMocks.get(ExamResultEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(40);
  });

  it('should create 25 LMS staff attendance records (5 days × 5 staff)', async () => {
    await service.run();

    const repo = repoMocks.get(StaffAttendanceEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(25);
  });

  it('should create 2 LMS staff leave requests', async () => {
    await service.run();

    const repo = repoMocks.get(StaffLeaveEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(2);
  });

  it('should create 5 salary slips', async () => {
    await service.run();

    const repo = repoMocks.get(SalarySlipEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(5);
  });

  it('should create 3 LMS notices', async () => {
    await service.run();

    const repo = repoMocks.get(LmsNoticeEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(3);
  });

  it('should create 10 timetable slots', async () => {
    await service.run();

    const repo = repoMocks.get(TimetableSlotEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(10);
  });

  it('should create 3 income records', async () => {
    await service.run();

    const repo = repoMocks.get(IncomeEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(3);
  });

  it('should create 3 expense records', async () => {
    await service.run();

    const repo = repoMocks.get(ExpenseEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(3);
  });

  it('should create staff management records', async () => {
    await service.run();

    const repo = repoMocks.get(StaffMgmtEntity)!;
    expect(repo.save).toHaveBeenCalled();
  });

  it('should create staff branch assignments', async () => {
    await service.run();

    const repo = repoMocks.get(StaffBranchAssignmentEntity)!;
    expect(repo.save).toHaveBeenCalled();
  });

  it('should create staff attendance records (module)', async () => {
    await service.run();

    const repo = repoMocks.get(StaffAttendanceRecordEntity)!;
    expect(repo.save).toHaveBeenCalled();
  });

  it('should create staff leave applications', async () => {
    await service.run();

    const repo = repoMocks.get(StaffLeaveApplicationEntity)!;
    expect(repo.save).toHaveBeenCalled();
  });

  it('should create staff leave balances', async () => {
    await service.run();

    const repo = repoMocks.get(StaffLeaveBalanceEntity)!;
    expect(repo.save).toHaveBeenCalled();
  });

  it('should create salary structures', async () => {
    await service.run();

    const repo = repoMocks.get(SalaryStructureEntity)!;
    expect(repo.save).toHaveBeenCalled();
  });

  it('should create payroll slips', async () => {
    await service.run();

    const repo = repoMocks.get(PayrollSlipEntity)!;
    expect(repo.save).toHaveBeenCalled();
  });

  it('should create materials', async () => {
    await service.run();

    const repo = repoMocks.get(MaterialEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(3);
  });

  it('should create assignments', async () => {
    await service.run();

    const repo = repoMocks.get(AssignmentEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(2);
  });

  it('should create course materials', async () => {
    await service.run();

    const repo = repoMocks.get(CourseMaterialEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(2);
  });

  it('should create 10 student guardians', async () => {
    await service.run();

    const repo = repoMocks.get(StudentGuardianEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(10);
  });

  it('should create 3 admission enquiries', async () => {
    await service.run();

    const repo = repoMocks.get(AdmissionEnquiryEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(3);
  });

  it('should create 3 standalone notices', async () => {
    await service.run();

    const repo = repoMocks.get(StandaloneNoticeEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(3);
  });

  it('should create 3 branch income records', async () => {
    await service.run();

    const repo = repoMocks.get(BranchIncomeEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(3);
  });

  it('should create 3 branch expense records', async () => {
    await service.run();

    const repo = repoMocks.get(BranchExpenseEntity)!;
    expect(repo.save).toHaveBeenCalledTimes(3);
  });

  // ─── UPDATE TESTS ─────────────────────────────────────────────

  it('should update institution after creation', async () => {
    await service.run();

    const repo = repoMocks.get(InstitutionEntity)!;
    expect(repo.update).toHaveBeenCalled();
    const updateCall = repo.update.mock.calls[0];
    expect(updateCall[1]).toHaveProperty('website');
  });

  it('should update department after creation', async () => {
    await service.run();

    const repo = repoMocks.get(DepartmentEntity)!;
    expect(repo.update).toHaveBeenCalled();
    expect(repo.update.mock.calls[0][1]).toHaveProperty('description');
  });

  it('should update grade class after creation', async () => {
    await service.run();

    const repo = repoMocks.get(GradeClassEntity)!;
    expect(repo.update).toHaveBeenCalled();
  });

  it('should update student after creation', async () => {
    await service.run();

    const repo = repoMocks.get(StudentEntity)!;
    expect(repo.update).toHaveBeenCalled();
    expect(repo.update.mock.calls[0][1]).toHaveProperty('city');
  });

  it('should update staff after creation', async () => {
    await service.run();

    const repo = repoMocks.get(StaffEntity)!;
    expect(repo.update).toHaveBeenCalled();
    expect(repo.update.mock.calls[0][1]).toHaveProperty('designation');
  });

  it('should update fee structure after creation', async () => {
    await service.run();

    const repo = repoMocks.get(FeeStructureEntity)!;
    expect(repo.update).toHaveBeenCalled();
  });

  it('should update exam after creation', async () => {
    await service.run();

    const repo = repoMocks.get(ExamEntity)!;
    expect(repo.update).toHaveBeenCalled();
  });

  it('should update user after creation', async () => {
    await service.run();

    const repo = repoMocks.get(UserEntity)!;
    expect(repo.update).toHaveBeenCalled();
    expect(repo.update.mock.calls[0][1]).toHaveProperty('lastName');
  });

  it('should update academic year after creation', async () => {
    await service.run();

    const repo = repoMocks.get(AcademicYearEntity)!;
    expect(repo.update).toHaveBeenCalled();
  });

  it('should update grading scale after creation', async () => {
    await service.run();

    const repo = repoMocks.get(GradingScaleEntity)!;
    expect(repo.update).toHaveBeenCalled();
  });

  // ─── TENANT CONTEXT TESTS ────────────────────────────────────

  it('should set tenantId on tenant-aware entities', async () => {
    await service.run();

    const repo = repoMocks.get(InstitutionEntity)!;
    // withTenant() sets tenantId on the entity passed to save(), not on create() input
    const savedInstitution = repo.save.mock.calls[0][0];
    expect(savedInstitution.tenantId).toBe(
      '00000000-0000-0000-0000-000000000001',
    );
  });

  it('should set branchId on tenant-aware entities', async () => {
    await service.run();

    const repo = repoMocks.get(InstitutionEntity)!;
    const savedInstitution = repo.save.mock.calls[0][0];
    expect(savedInstitution.branchId).toBe(
      '00000000-0000-0000-0000-000000000001',
    );
  });

  // ─── DATA INTEGRITY TESTS ────────────────────────────────────

  it('should create students with proper user references', async () => {
    await service.run();

    const repo = repoMocks.get(StudentEntity)!;
    const firstStudent = repo.create.mock.calls[0][0];
    expect(firstStudent.user).toBeDefined();
    expect(firstStudent.user.id).toBeDefined();
    expect(firstStudent.institution).toBeDefined();
    expect(firstStudent.institution.id).toBeDefined();
  });

  it('should create enrollments with proper student and section references', async () => {
    await service.run();

    const repo = repoMocks.get(StudentEnrollmentEntity)!;
    const firstEnrollment = repo.create.mock.calls[0][0];
    expect(firstEnrollment.student).toBeDefined();
    expect(firstEnrollment.section).toBeDefined();
    expect(firstEnrollment.academicYear).toBeDefined();
  });

  it('should create exam results with proper examSubject and student references', async () => {
    await service.run();

    const repo = repoMocks.get(ExamResultEntity)!;
    const firstResult = repo.create.mock.calls[0][0];
    expect(firstResult.examSubject).toBeDefined();
    expect(firstResult.student).toBeDefined();
    expect(firstResult.marksObtained).toBeDefined();
    expect(firstResult.grade).toBeDefined();
  });

  it('should create fee challans with unique challan numbers', async () => {
    await service.run();

    const repo = repoMocks.get(FeeChallanEntity)!;
    const challanNumbers = repo.create.mock.calls.map(
      (c: any[]) => c[0].challanNumber,
    );
    const uniqueNums = new Set(challanNumbers);
    expect(uniqueNums.size).toBe(challanNumbers.length);
  });

  it('should create salary structures with proper component breakdown', async () => {
    await service.run();

    const repo = repoMocks.get(SalaryStructureEntity)!;
    const firstStructure = repo.create.mock.calls[0][0];
    expect(firstStructure.components).toBeInstanceOf(Array);
    expect(firstStructure.components.length).toBeGreaterThan(0);
    expect(firstStructure.totalEarnings).toBeGreaterThan(0);
    expect(firstStructure.netPay).toBeGreaterThan(0);
  });

  // ─── COVERAGE: all entity types accessed ──────────────────────

  it('should access repositories for all major entity types', async () => {
    await service.run();

    const accessedEntities = new Set(
      mockDataSource.getRepository.mock.calls.map((call: any[]) => call[0]),
    );

    for (const entity of ALL_ENTITIES) {
      expect(accessedEntities.has(entity)).toBe(true);
    }
  });
});
