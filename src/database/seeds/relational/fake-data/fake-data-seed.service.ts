import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

// ── Infrastructure entities ──
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

// ── LMS Courses entities ──
import { InstitutionEntity } from '../../../../lms/courses/infrastructure/persistence/relational/entities/institution.entity';
import { DepartmentEntity } from '../../../../lms/courses/infrastructure/persistence/relational/entities/department.entity';
import { GradeClassEntity } from '../../../../lms/courses/infrastructure/persistence/relational/entities/grade-class.entity';
import { SectionEntity } from '../../../../lms/courses/infrastructure/persistence/relational/entities/section.entity';
import { SubjectEntity } from '../../../../lms/courses/infrastructure/persistence/relational/entities/subject.entity';

// ── LMS Academic entities ──
import { AcademicYearEntity } from '../../../../lms/academic/infrastructure/persistence/relational/entities/academic-year.entity';
import { TermEntity } from '../../../../lms/academic/infrastructure/persistence/relational/entities/term.entity';

// ── LMS Student entities ──
import { StudentEntity } from '../../../../lms/student/infrastructure/persistence/relational/entities/student.entity';
import { StudentEnrollmentEntity } from '../../../../lms/student/infrastructure/persistence/relational/entities/student-enrollment.entity';
import { StudentAttendanceEntity } from '../../../../lms/student/infrastructure/persistence/relational/entities/student-attendance.entity';
import { LeaveRequestEntity } from '../../../../lms/student/infrastructure/persistence/relational/entities/leave-request.entity';
import { FeeStructureEntity } from '../../../../lms/student/infrastructure/persistence/relational/entities/fee-structure.entity';
import { FeeChallanEntity } from '../../../../lms/student/infrastructure/persistence/relational/entities/fee-challan.entity';
import { FeePaymentEntity } from '../../../../lms/student/infrastructure/persistence/relational/entities/fee-payment.entity';
import { ExamEntity } from '../../../../lms/student/infrastructure/persistence/relational/entities/exam.entity';
import { ExamSubjectEntity } from '../../../../lms/student/infrastructure/persistence/relational/entities/exam-subject.entity';
import { ExamResultEntity } from '../../../../lms/student/infrastructure/persistence/relational/entities/exam-result.entity';
import { CourseMaterialEntity } from '../../../../lms/student/infrastructure/persistence/relational/entities/course-material.entity';
import { AdmissionEnquiryEntity } from '../../../../lms/student/infrastructure/persistence/relational/entities/admission-enquiry.entity';

// ── LMS Staff entities ──
import { StaffEntity } from '../../../../lms/staff/infrastructure/persistence/relational/entities/staff.entity';
import { StaffAttendanceEntity } from '../../../../lms/staff/infrastructure/persistence/relational/entities/staff-attendance.entity';
import { StaffLeaveEntity } from '../../../../lms/staff/infrastructure/persistence/relational/entities/staff-leave.entity';
import { SalarySlipEntity } from '../../../../lms/staff/infrastructure/persistence/relational/entities/salary-slip.entity';
import { NoticeEntity as LmsNoticeEntity } from '../../../../lms/staff/infrastructure/persistence/relational/entities/notice.entity';
import { TimetableSlotEntity } from '../../../../lms/staff/infrastructure/persistence/relational/entities/timetable-slot.entity';

// ── LMS Accounts entities ──
import { IncomeEntity } from '../../../../lms/accounts/infrastructure/persistence/relational/entities/income.entity';
import { ExpenseEntity } from '../../../../lms/accounts/infrastructure/persistence/relational/entities/expense.entity';

// ── Staff Management entities ──
import { StaffMgmtEntity } from '../../../../staff-management/infrastructure/persistence/relational/entities/staff-mgmt.entity';
import { StaffBranchAssignmentEntity } from '../../../../staff-management/infrastructure/persistence/relational/entities/staff-branch-assignment.entity';

// ── Staff Attendance module entities ──
import { StaffAttendanceRecordEntity } from '../../../../staff-attendance/infrastructure/persistence/relational/entities/staff-attendance-record.entity';
import { StaffLeaveApplicationEntity } from '../../../../staff-attendance/infrastructure/persistence/relational/entities/staff-leave-application.entity';
import { StaffLeaveBalanceEntity } from '../../../../staff-attendance/infrastructure/persistence/relational/entities/staff-leave-balance.entity';

// ── Payroll entities ──
import { SalaryStructureEntity } from '../../../../payroll/infrastructure/persistence/relational/entities/salary-structure.entity';
import { PayrollSlipEntity } from '../../../../payroll/infrastructure/persistence/relational/entities/payroll-slip.entity';

// ── Materials entities ──
import { MaterialEntity } from '../../../../materials/infrastructure/persistence/relational/entities/material.entity';
import { AssignmentEntity } from '../../../../materials/infrastructure/persistence/relational/entities/assignment.entity';

// ── Exams entities ──
import { GradingScaleEntity } from '../../../../exams/infrastructure/persistence/relational/entities/grading-scale.entity';

// ── Fees entities ──
import { ConcessionEntity } from '../../../../fees/infrastructure/persistence/relational/entities/concession.entity';
import { ReceiptEntity } from '../../../../fees/infrastructure/persistence/relational/entities/receipt.entity';

// ── Student Registration entities ──
import { StudentGuardianEntity } from '../../../../student-registration/infrastructure/persistence/relational/entities/student-guardian.entity';

// ── Standalone Notices entity ──
import { NoticeEntity as StandaloneNoticeEntity } from '../../../../notices/infrastructure/persistence/relational/entities/notice.entity';

// ── Branch Income/Expense entities ──
import { BranchIncomeEntity } from '../../../../income/infrastructure/persistence/relational/entities/branch-income.entity';
import { BranchExpenseEntity } from '../../../../expenses/infrastructure/persistence/relational/entities/branch-expense.entity';

// ── Enums ──
import { RoleEnum } from '../../../../roles/roles.enum';
import { StatusEnum } from '../../../../statuses/statuses.enum';
import {
  GenderEnum,
  DayOfWeekEnum,
  EnrollmentStatusEnum,
  EmploymentTypeEnum,
  TargetAudienceEnum,
  CourseMaterialTypeEnum,
  SalaryStatusEnum,
  ExpenseStatusEnum,
  EnquirySourceEnum,
} from '../../../../lms/common/enums/general.enum';
import { AttendanceStatusEnum } from '../../../../lms/common/enums/attendance-status.enum';
import {
  LeaveStatusEnum,
  LeaveTypeEnum,
} from '../../../../lms/common/enums/leave-status.enum';
import {
  PaymentStatusEnum,
  PaymentMethodEnum,
  FeeFrequencyEnum,
} from '../../../../lms/common/enums/payment-status.enum';
import { ExamTypeEnum } from '../../../../lms/common/enums/exam.enum';
import { ExamStatusEnum } from '../../../../lms/common/enums/exam-status.enum';
import { AdmissionStatusEnum } from '../../../../lms/common/enums/admission-status.enum';
import { ConcessionTypeEnum } from '../../../../fees/domain/concession-type.enum';

// ── Constants ──
const TENANT_ID = '00000000-0000-0000-0000-000000000001';
const BRANCH_ID = '00000000-0000-0000-0000-000000000001';
const FAKE_INSTITUTION_CODE = 'FAKE-SEED';
const DEFAULT_PASSWORD = 'secret';

// Helpers for tenant-aware context
function withTenant<T>(entity: T): T {
  (entity as any).tenantId = TENANT_ID;
  (entity as any).branchId = BRANCH_ID;
  return entity;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function pastWeekday(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return formatDate(d);
}

// ── Interfaces for return types ──
interface SeededUsers {
  studentUserIds: number[];
  teacherUserIds: number[];
  staffUserIds: number[];
  accountantUserId: number;
  parentUserId: number;
}

@Injectable()
export class FakeDataSeedService {
  private readonly logger = new Logger(FakeDataSeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    faker.seed(42);

    const institutionRepo = this.dataSource.getRepository(InstitutionEntity);
    const existing = await institutionRepo.count({
      where: { code: FAKE_INSTITUTION_CODE },
    });

    if (existing) {
      this.logger.log('Fake data already exists. Skipping.');
      return;
    }

    this.logger.log('Seeding fake data...');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

    // Phase 1 — Core Structure
    const users = await this.seedUsers(hashedPassword);
    const institution = await this.seedInstitution();
    const departments = await this.seedDepartments(institution.id);
    const gradeClasses = await this.seedGradeClasses(institution.id);
    const sections = await this.seedSections(gradeClasses);
    const subjects = await this.seedSubjects(departments);

    // Phase 2 — Academic Data
    const { academicYear, terms } = await this.seedAcademicData(institution.id);

    // Phase 3 — People
    const students = await this.seedStudents(
      users.studentUserIds,
      institution.id,
    );
    const lmsStaff = await this.seedLmsStaff(
      users.teacherUserIds,
      institution.id,
      departments,
    );
    const staffMgmtRecords = await this.seedStaffManagement(
      users.staffUserIds,
      institution.id,
      departments,
    );

    // Phase 4 — Enrollments & Attendance
    const enrollments = await this.seedEnrollments(
      students,
      sections,
      academicYear.id,
    );
    await this.seedStudentAttendance(students, sections);
    await this.seedStudentLeaves(students);

    // Phase 5 — Fees
    const feeStructures = await this.seedFeeStructures(
      institution.id,
      gradeClasses,
      academicYear.id,
    );
    const challans = await this.seedFeeChallans(students, feeStructures);
    const payments = await this.seedFeePayments(challans);
    await this.seedReceipts(payments, students);
    await this.seedConcessions(students);

    // Phase 6 — Exams
    await this.seedGradingScale();
    const exams = await this.seedExams(terms);
    const examSubjects = await this.seedExamSubjects(exams, subjects);
    await this.seedExamResults(examSubjects, students);

    // Phase 7 — LMS Staff Operations
    await this.seedLmsStaffAttendance(lmsStaff);
    await this.seedLmsStaffLeaves(lmsStaff);
    await this.seedSalarySlips(lmsStaff);
    await this.seedLmsNotices(institution.id, lmsStaff);
    await this.seedTimetableSlots(sections, subjects, lmsStaff);

    // Phase 8 — LMS Accounts
    await this.seedIncome(institution.id);
    await this.seedExpense(institution.id);

    // Phase 9 — Staff Management Module
    await this.seedStaffBranchAssignments(staffMgmtRecords);
    await this.seedStaffAttendanceRecords(staffMgmtRecords);
    await this.seedStaffLeaveApplications(staffMgmtRecords);
    await this.seedStaffLeaveBalances(staffMgmtRecords);

    // Phase 10 — Payroll
    const salaryStructures = await this.seedSalaryStructures(staffMgmtRecords);
    await this.seedPayrollSlips(staffMgmtRecords, salaryStructures);

    // Phase 11 — Materials
    await this.seedMaterials(subjects);
    await this.seedAssignments(subjects);
    await this.seedCourseMaterials(subjects);

    // Phase 12 — Misc
    await this.seedStudentGuardians(students);
    await this.seedAdmissionEnquiries(institution.id);
    await this.seedStandaloneNotices();
    await this.seedBranchIncome();
    await this.seedBranchExpense();

    // Phase 13 — Update operations (verify updation works)
    await this.updateEntities(
      institution,
      departments,
      gradeClasses,
      students,
      lmsStaff,
      feeStructures,
      exams,
    );

    this.logger.log('Fake data seeding complete!');
  }

  // ─── SEED METHODS ───────────────────────────────────────────────

  private async seedUsers(hashedPassword: string): Promise<SeededUsers> {
    const repo = this.dataSource.getRepository(UserEntity);
    const studentUserIds: number[] = [];
    const teacherUserIds: number[] = [];
    const staffUserIds: number[] = [];

    // 10 Student users
    for (let i = 1; i <= 10; i++) {
      const user = await repo.save(
        repo.create({
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: `fake-student-${i}@example.com`,
          password: hashedPassword,
          role: { id: RoleEnum.student } as any,
          status: { id: StatusEnum.active } as any,
        }),
      );
      studentUserIds.push(user.id);
    }

    // 5 Teacher users
    for (let i = 1; i <= 5; i++) {
      const user = await repo.save(
        repo.create({
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: `fake-teacher-${i}@example.com`,
          password: hashedPassword,
          role: { id: RoleEnum.teacher } as any,
          status: { id: StatusEnum.active } as any,
        }),
      );
      teacherUserIds.push(user.id);
    }

    // 2 Staff users
    for (let i = 1; i <= 2; i++) {
      const user = await repo.save(
        repo.create({
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: `fake-staff-${i}@example.com`,
          password: hashedPassword,
          role: { id: RoleEnum.staff } as any,
          status: { id: StatusEnum.active } as any,
        }),
      );
      staffUserIds.push(user.id);
    }

    // 1 Accountant
    const accountant = await repo.save(
      repo.create({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: 'fake-accountant-1@example.com',
        password: hashedPassword,
        role: { id: RoleEnum.accountant } as any,
        status: { id: StatusEnum.active } as any,
      }),
    );

    // 1 Parent
    const parent = await repo.save(
      repo.create({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: 'fake-parent-1@example.com',
        password: hashedPassword,
        role: { id: RoleEnum.parent } as any,
        status: { id: StatusEnum.active } as any,
      }),
    );

    this.logger.log('  Users seeded (19 total)');
    return {
      studentUserIds,
      teacherUserIds,
      staffUserIds,
      accountantUserId: accountant.id,
      parentUserId: parent.id,
    };
  }

  private async seedInstitution(): Promise<InstitutionEntity> {
    const repo = this.dataSource.getRepository(InstitutionEntity);
    const institution = await repo.save(
      withTenant(
        repo.create({
          name: 'Sunrise International Academy',
          code: FAKE_INSTITUTION_CODE,
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          country: 'United States',
          phone: faker.phone.number(),
          email: 'info@sunrise-academy.edu',
          website: 'https://sunrise-academy.edu',
          isActive: true,
        }),
      ),
    );
    this.logger.log('  Institution seeded');
    return institution;
  }

  private async seedDepartments(
    institutionId: number,
  ): Promise<DepartmentEntity[]> {
    const repo = this.dataSource.getRepository(DepartmentEntity);
    const deptData = [
      { name: 'Science', code: 'FAKE-SCI', description: 'Science department' },
      {
        name: 'Arts',
        code: 'FAKE-ART',
        description: 'Arts & Humanities department',
      },
      {
        name: 'Commerce',
        code: 'FAKE-COM',
        description: 'Commerce & Business department',
      },
    ];

    const departments: DepartmentEntity[] = [];
    for (const d of deptData) {
      const dept = await repo.save(
        withTenant(
          repo.create({
            ...d,
            institution: { id: institutionId } as InstitutionEntity,
          }),
        ),
      );
      departments.push(dept);
    }
    this.logger.log('  Departments seeded (3)');
    return departments;
  }

  private async seedGradeClasses(
    institutionId: number,
  ): Promise<GradeClassEntity[]> {
    const repo = this.dataSource.getRepository(GradeClassEntity);
    const gradeData = [
      { name: 'Grade 9', numericGrade: 9 },
      { name: 'Grade 10', numericGrade: 10 },
      { name: 'Grade 11', numericGrade: 11 },
      { name: 'Grade 12', numericGrade: 12 },
    ];

    const classes: GradeClassEntity[] = [];
    for (const g of gradeData) {
      const cls = await repo.save(
        withTenant(
          repo.create({
            ...g,
            description: `${g.name} curriculum`,
            institution: { id: institutionId } as InstitutionEntity,
          }),
        ),
      );
      classes.push(cls);
    }
    this.logger.log('  Grade classes seeded (4)');
    return classes;
  }

  private async seedSections(
    gradeClasses: GradeClassEntity[],
  ): Promise<SectionEntity[]> {
    const repo = this.dataSource.getRepository(SectionEntity);
    const sections: SectionEntity[] = [];

    for (const gc of gradeClasses) {
      for (const sectionName of ['A', 'B']) {
        const section = await repo.save(
          withTenant(
            repo.create({
              name: sectionName,
              capacity: 40,
              gradeClass: { id: gc.id } as GradeClassEntity,
            }),
          ),
        );
        sections.push(section);
      }
    }
    this.logger.log('  Sections seeded (8)');
    return sections;
  }

  private async seedSubjects(
    departments: DepartmentEntity[],
  ): Promise<SubjectEntity[]> {
    const repo = this.dataSource.getRepository(SubjectEntity);
    const subjectData = [
      { name: 'Mathematics', code: 'FAKE-MATH', creditHours: 4, deptIdx: 0 },
      { name: 'Physics', code: 'FAKE-PHY', creditHours: 3, deptIdx: 0 },
      { name: 'English', code: 'FAKE-ENG', creditHours: 3, deptIdx: 1 },
      { name: 'History', code: 'FAKE-HIS', creditHours: 2, deptIdx: 1 },
      { name: 'Economics', code: 'FAKE-ECO', creditHours: 3, deptIdx: 2 },
      { name: 'Accounting', code: 'FAKE-ACC', creditHours: 3, deptIdx: 2 },
    ];

    const subjects: SubjectEntity[] = [];
    for (const s of subjectData) {
      const subj = await repo.save(
        withTenant(
          repo.create({
            name: s.name,
            code: s.code,
            creditHours: s.creditHours,
            description: `${s.name} course`,
            department: {
              id: departments[s.deptIdx].id,
            } as DepartmentEntity,
          }),
        ),
      );
      subjects.push(subj);
    }
    this.logger.log('  Subjects seeded (6)');
    return subjects;
  }

  private async seedAcademicData(
    institutionId: number,
  ): Promise<{ academicYear: AcademicYearEntity; terms: TermEntity[] }> {
    const yearRepo = this.dataSource.getRepository(AcademicYearEntity);
    const termRepo = this.dataSource.getRepository(TermEntity);

    const academicYear = await yearRepo.save(
      withTenant(
        yearRepo.create({
          name: '2025-2026',
          startDate: '2025-09-01',
          endDate: '2026-06-30',
          isCurrent: true,
          institution: { id: institutionId } as InstitutionEntity,
        }),
      ),
    );

    const termData = [
      {
        name: 'Fall 2025',
        startDate: '2025-09-01',
        endDate: '2025-12-20',
      },
      {
        name: 'Spring 2026',
        startDate: '2026-01-15',
        endDate: '2026-06-30',
      },
    ];

    const terms: TermEntity[] = [];
    for (const t of termData) {
      const term = await termRepo.save(
        withTenant(
          termRepo.create({
            ...t,
            academicYear: { id: academicYear.id } as AcademicYearEntity,
          }),
        ),
      );
      terms.push(term);
    }
    this.logger.log('  Academic year & terms seeded');
    return { academicYear, terms };
  }

  private async seedStudents(
    userIds: number[],
    institutionId: number,
  ): Promise<StudentEntity[]> {
    const repo = this.dataSource.getRepository(StudentEntity);
    const genders = [GenderEnum.male, GenderEnum.female, GenderEnum.other];
    const students: StudentEntity[] = [];

    for (let i = 0; i < userIds.length; i++) {
      const student = await repo.save(
        withTenant(
          repo.create({
            rollNumber: `FAKE-STD-${String(i + 1).padStart(3, '0')}`,
            dateOfBirth: formatDate(
              faker.date.birthdate({ min: 13, max: 18, mode: 'age' }),
            ),
            gender: genders[i % 3],
            guardianName: faker.person.fullName(),
            guardianPhone: faker.phone.number(),
            guardianEmail: faker.internet.email(),
            guardianRelation: i % 2 === 0 ? 'Father' : 'Mother',
            address: faker.location.streetAddress(),
            city: faker.location.city(),
            admissionDate: '2025-09-01',
            user: { id: userIds[i] } as UserEntity,
            institution: { id: institutionId } as InstitutionEntity,
          }),
        ),
      );
      students.push(student);
    }
    this.logger.log('  Students seeded (10)');
    return students;
  }

  private async seedLmsStaff(
    teacherUserIds: number[],
    institutionId: number,
    departments: DepartmentEntity[],
  ): Promise<StaffEntity[]> {
    const repo = this.dataSource.getRepository(StaffEntity);
    const designations = [
      'Senior Teacher',
      'Teacher',
      'Assistant Teacher',
      'Lab Instructor',
      'Head of Department',
    ];
    const staff: StaffEntity[] = [];

    for (let i = 0; i < teacherUserIds.length; i++) {
      const s = await repo.save(
        withTenant(
          repo.create({
            employeeId: `FAKE-EMP-${String(i + 1).padStart(3, '0')}`,
            designation: designations[i],
            qualification: faker.helpers.arrayElement([
              'M.Sc.',
              'M.A.',
              'M.Ed.',
              'Ph.D.',
            ]),
            specialization: faker.lorem.words(3),
            experienceYears: faker.number.int({ min: 2, max: 20 }),
            joiningDate: '2024-01-15',
            basicSalary: faker.number.int({ min: 30000, max: 80000 }),
            employmentType: EmploymentTypeEnum.full_time,
            emergencyContact: faker.phone.number(),
            address: faker.location.streetAddress(),
            user: { id: teacherUserIds[i] } as UserEntity,
            institution: { id: institutionId } as InstitutionEntity,
            department: {
              id: departments[i % departments.length].id,
            } as DepartmentEntity,
          }),
        ),
      );
      staff.push(s);
    }
    this.logger.log('  LMS Staff seeded (5)');
    return staff;
  }

  private async seedStaffManagement(
    staffUserIds: number[],
    institutionId: number,
    departments: DepartmentEntity[],
  ): Promise<StaffMgmtEntity[]> {
    const repo = this.dataSource.getRepository(StaffMgmtEntity);
    const records: StaffMgmtEntity[] = [];

    for (let i = 0; i < staffUserIds.length; i++) {
      const sm = await repo.save(
        withTenant(
          repo.create({
            staffId: `default-STF-2025-${String(i + 1).padStart(4, '0')}`,
            primaryBranchId: BRANCH_ID,
            designation: faker.person.jobTitle(),
            qualification: faker.helpers.arrayElement([
              'MBA',
              'BBA',
              'B.Sc.',
            ]),
            experienceYears: faker.number.int({ min: 1, max: 10 }),
            joiningDate: '2025-01-10',
            basicSalary: faker.number.int({ min: 25000, max: 60000 }),
            employmentType: EmploymentTypeEnum.full_time,
            address: faker.location.streetAddress(),
            user: { id: staffUserIds[i] } as UserEntity,
            institution: { id: institutionId } as InstitutionEntity,
            department: {
              id: departments[i % departments.length].id,
            } as DepartmentEntity,
          }),
        ),
      );
      records.push(sm);
    }
    this.logger.log('  Staff Management seeded (2)');
    return records;
  }

  private async seedEnrollments(
    students: StudentEntity[],
    sections: SectionEntity[],
    academicYearId: number,
  ): Promise<StudentEnrollmentEntity[]> {
    const repo = this.dataSource.getRepository(StudentEnrollmentEntity);
    const enrollments: StudentEnrollmentEntity[] = [];

    for (let i = 0; i < students.length; i++) {
      const enrollment = await repo.save(
        withTenant(
          repo.create({
            status: EnrollmentStatusEnum.active,
            enrollmentDate: '2025-09-01',
            student: { id: students[i].id } as StudentEntity,
            section: {
              id: sections[i % sections.length].id,
            } as SectionEntity,
            academicYear: { id: academicYearId } as AcademicYearEntity,
          }),
        ),
      );
      enrollments.push(enrollment);
    }
    this.logger.log('  Enrollments seeded (10)');
    return enrollments;
  }

  private async seedStudentAttendance(
    students: StudentEntity[],
    sections: SectionEntity[],
  ): Promise<void> {
    const repo = this.dataSource.getRepository(StudentAttendanceEntity);
    const statuses = [
      AttendanceStatusEnum.present,
      AttendanceStatusEnum.present,
      AttendanceStatusEnum.present,
      AttendanceStatusEnum.late,
      AttendanceStatusEnum.absent,
    ];

    for (let day = 1; day <= 5; day++) {
      for (let i = 0; i < students.length; i++) {
        await repo.save(
          withTenant(
            repo.create({
              date: pastWeekday(day),
              status: statuses[(day + i) % statuses.length],
              remarks:
                statuses[(day + i) % statuses.length] ===
                AttendanceStatusEnum.absent
                  ? 'Unexcused absence'
                  : null,
              student: { id: students[i].id } as StudentEntity,
              section: {
                id: sections[i % sections.length].id,
              } as SectionEntity,
            }),
          ),
        );
      }
    }
    this.logger.log('  Student attendance seeded (50 records)');
  }

  private async seedStudentLeaves(students: StudentEntity[]): Promise<void> {
    const repo = this.dataSource.getRepository(LeaveRequestEntity);
    const leaveData = [
      {
        reason: 'Family event',
        status: LeaveStatusEnum.approved,
        days: 2,
      },
      {
        reason: 'Medical appointment',
        status: LeaveStatusEnum.pending,
        days: 1,
      },
      {
        reason: 'Personal reasons',
        status: LeaveStatusEnum.rejected,
        days: 3,
      },
    ];

    for (let i = 0; i < leaveData.length; i++) {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() + 7 + i * 5);
      const toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + leaveData[i].days);

      await repo.save(
        withTenant(
          repo.create({
            fromDate: formatDate(fromDate),
            toDate: formatDate(toDate),
            reason: leaveData[i].reason,
            status: leaveData[i].status,
            student: { id: students[i].id } as StudentEntity,
          }),
        ),
      );
    }
    this.logger.log('  Student leaves seeded (3)');
  }

  private async seedFeeStructures(
    institutionId: number,
    gradeClasses: GradeClassEntity[],
    academicYearId: number,
  ): Promise<FeeStructureEntity[]> {
    const repo = this.dataSource.getRepository(FeeStructureEntity);
    const structures: FeeStructureEntity[] = [];

    const structureData = [
      {
        name: 'Monthly Tuition',
        amount: 5000,
        frequency: FeeFrequencyEnum.monthly,
      },
      {
        name: 'Annual Registration',
        amount: 15000,
        frequency: FeeFrequencyEnum.annual,
      },
    ];

    for (const sd of structureData) {
      const fs = await repo.save(
        withTenant(
          repo.create({
            name: sd.name,
            amount: sd.amount,
            frequency: sd.frequency,
            description: `${sd.name} fee for academic year 2025-2026`,
            institution: { id: institutionId } as InstitutionEntity,
            gradeClass: { id: gradeClasses[0].id } as GradeClassEntity,
            academicYear: { id: academicYearId } as AcademicYearEntity,
          }),
        ),
      );
      structures.push(fs);
    }
    this.logger.log('  Fee structures seeded (2)');
    return structures;
  }

  private async seedFeeChallans(
    students: StudentEntity[],
    feeStructures: FeeStructureEntity[],
  ): Promise<FeeChallanEntity[]> {
    const repo = this.dataSource.getRepository(FeeChallanEntity);
    const challans: FeeChallanEntity[] = [];

    for (let i = 0; i < students.length; i++) {
      const challan = await repo.save(
        withTenant(
          repo.create({
            challanNumber: `FAKE-CH-2025-${String(i + 1).padStart(3, '0')}`,
            totalAmount: 5000,
            paidAmount: i < 5 ? 5000 : 0,
            discount: 0,
            dueDate: '2025-10-15',
            issueDate: '2025-09-15',
            status:
              i < 5 ? PaymentStatusEnum.paid : PaymentStatusEnum.pending,
            student: { id: students[i].id } as StudentEntity,
            feeStructure: {
              id: feeStructures[0].id,
            } as FeeStructureEntity,
          }),
        ),
      );
      challans.push(challan);
    }
    this.logger.log('  Fee challans seeded (10)');
    return challans;
  }

  private async seedFeePayments(
    challans: FeeChallanEntity[],
  ): Promise<FeePaymentEntity[]> {
    const repo = this.dataSource.getRepository(FeePaymentEntity);
    const payments: FeePaymentEntity[] = [];
    const methods = [
      PaymentMethodEnum.cash,
      PaymentMethodEnum.bank_transfer,
      PaymentMethodEnum.online,
      PaymentMethodEnum.card,
      PaymentMethodEnum.cheque,
    ];

    // Only create payments for challans that are paid (first 5)
    for (let i = 0; i < 5; i++) {
      const payment = await repo.save(
        withTenant(
          repo.create({
            amount: 5000,
            method: methods[i],
            transactionRef: `FAKE-TXN-${String(i + 1).padStart(3, '0')}`,
            receiptNumber: `FAKE-RN-${String(i + 1).padStart(3, '0')}`,
            paidAt: new Date('2025-10-01'),
            feeChallan: { id: challans[i].id } as FeeChallanEntity,
          }),
        ),
      );
      payments.push(payment);
    }
    this.logger.log('  Fee payments seeded (5)');
    return payments;
  }

  private async seedReceipts(
    payments: FeePaymentEntity[],
    students: StudentEntity[],
  ): Promise<void> {
    const repo = this.dataSource.getRepository(ReceiptEntity);

    for (let i = 0; i < payments.length; i++) {
      await repo.save(
        withTenant(
          repo.create({
            receiptNumber: `FAKE-RCP-${String(i + 1).padStart(3, '0')}`,
            amount: 5000,
            studentName: `Student ${i + 1}`,
            challanNumber: `FAKE-CH-2025-${String(i + 1).padStart(3, '0')}`,
            paymentMethod: 'cash',
            payment: { id: payments[i].id } as FeePaymentEntity,
          }),
        ),
      );
    }
    this.logger.log('  Receipts seeded (5)');
  }

  private async seedConcessions(students: StudentEntity[]): Promise<void> {
    const repo = this.dataSource.getRepository(ConcessionEntity);
    const types = [
      ConcessionTypeEnum.scholarship,
      ConcessionTypeEnum.merit,
      ConcessionTypeEnum.sibling,
    ];

    for (let i = 0; i < 3; i++) {
      await repo.save(
        withTenant(
          repo.create({
            type: types[i],
            discountPercentage: faker.number.int({ min: 10, max: 50 }),
            validFrom: '2025-09-01',
            validTo: '2026-06-30',
            reason: `${types[i]} concession awarded`,
            approved: i < 2,
            student: { id: students[i].id } as StudentEntity,
          }),
        ),
      );
    }
    this.logger.log('  Concessions seeded (3)');
  }

  private async seedGradingScale(): Promise<void> {
    const repo = this.dataSource.getRepository(GradingScaleEntity);
    await repo.save(
      withTenant(
        repo.create({
          name: 'FAKE-Standard Grading',
          grades: [
            {
              minPercentage: 90,
              maxPercentage: 100,
              grade: 'A+',
              gradePoint: 4.0,
              description: 'Outstanding',
            },
            {
              minPercentage: 80,
              maxPercentage: 89,
              grade: 'A',
              gradePoint: 3.7,
              description: 'Excellent',
            },
            {
              minPercentage: 70,
              maxPercentage: 79,
              grade: 'B',
              gradePoint: 3.0,
              description: 'Good',
            },
            {
              minPercentage: 60,
              maxPercentage: 69,
              grade: 'C',
              gradePoint: 2.0,
              description: 'Average',
            },
            {
              minPercentage: 50,
              maxPercentage: 59,
              grade: 'D',
              gradePoint: 1.0,
              description: 'Below Average',
            },
            {
              minPercentage: 0,
              maxPercentage: 49,
              grade: 'F',
              gradePoint: 0,
              description: 'Fail',
            },
          ],
        }),
      ),
    );
    this.logger.log('  Grading scale seeded');
  }

  private async seedExams(terms: TermEntity[]): Promise<ExamEntity[]> {
    const repo = this.dataSource.getRepository(ExamEntity);
    const exams: ExamEntity[] = [];

    const examData = [
      {
        name: 'Midterm Examination 2025',
        type: ExamTypeEnum.midterm,
        status: ExamStatusEnum.completed,
        termIdx: 0,
      },
      {
        name: 'Quiz 1',
        type: ExamTypeEnum.quiz,
        status: ExamStatusEnum.results_published,
        termIdx: 0,
      },
    ];

    for (const e of examData) {
      const exam = await repo.save(
        withTenant(
          repo.create({
            name: e.name,
            type: e.type,
            status: e.status,
            startDate: '2025-10-15',
            endDate: '2025-10-20',
            description: `${e.name} for Fall 2025`,
            term: { id: terms[e.termIdx].id } as TermEntity,
          }),
        ),
      );
      exams.push(exam);
    }
    this.logger.log('  Exams seeded (2)');
    return exams;
  }

  private async seedExamSubjects(
    exams: ExamEntity[],
    subjects: SubjectEntity[],
  ): Promise<ExamSubjectEntity[]> {
    const repo = this.dataSource.getRepository(ExamSubjectEntity);
    const examSubjects: ExamSubjectEntity[] = [];

    // 4 subjects for the midterm exam
    for (let i = 0; i < 4 && i < subjects.length; i++) {
      const es = await repo.save(
        withTenant(
          repo.create({
            examDate: `2025-10-${15 + i}`,
            totalMarks: 100,
            passingMarks: 40,
            exam: { id: exams[0].id } as ExamEntity,
            subject: { id: subjects[i].id } as SubjectEntity,
          }),
        ),
      );
      examSubjects.push(es);
    }
    this.logger.log('  Exam subjects seeded (4)');
    return examSubjects;
  }

  private async seedExamResults(
    examSubjects: ExamSubjectEntity[],
    students: StudentEntity[],
  ): Promise<void> {
    const repo = this.dataSource.getRepository(ExamResultEntity);
    const grades = ['A+', 'A', 'B', 'C', 'D'];

    for (const es of examSubjects) {
      for (let i = 0; i < students.length; i++) {
        const marks = faker.number.int({ min: 35, max: 98 });
        const gradeIdx = Math.floor((100 - marks) / 10);

        await repo.save(
          withTenant(
            repo.create({
              marksObtained: marks,
              grade: grades[Math.min(gradeIdx, grades.length - 1)],
              isAbsent: false,
              percentage: marks,
              examSubject: { id: es.id } as ExamSubjectEntity,
              student: { id: students[i].id } as StudentEntity,
            }),
          ),
        );
      }
    }
    this.logger.log('  Exam results seeded (40)');
  }

  private async seedLmsStaffAttendance(
    staff: StaffEntity[],
  ): Promise<void> {
    const repo = this.dataSource.getRepository(StaffAttendanceEntity);

    for (let day = 1; day <= 5; day++) {
      for (const s of staff) {
        await repo.save(
          withTenant(
            repo.create({
              date: pastWeekday(day),
              status: AttendanceStatusEnum.present,
              checkIn: '08:00:00',
              checkOut: '16:00:00',
              staff: { id: s.id } as StaffEntity,
            }),
          ),
        );
      }
    }
    this.logger.log('  LMS Staff attendance seeded (25)');
  }

  private async seedLmsStaffLeaves(
    staff: StaffEntity[],
  ): Promise<void> {
    const repo = this.dataSource.getRepository(StaffLeaveEntity);

    for (let i = 0; i < 2; i++) {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() + 14 + i * 7);
      const toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + 2);

      await repo.save(
        withTenant(
          repo.create({
            fromDate: formatDate(fromDate),
            toDate: formatDate(toDate),
            leaveType: i === 0 ? LeaveTypeEnum.sick : LeaveTypeEnum.casual,
            reason: faker.lorem.sentence(),
            status: LeaveStatusEnum.pending,
            staff: { id: staff[i].id } as StaffEntity,
          }),
        ),
      );
    }
    this.logger.log('  LMS Staff leaves seeded (2)');
  }

  private async seedSalarySlips(staff: StaffEntity[]): Promise<void> {
    const repo = this.dataSource.getRepository(SalarySlipEntity);

    for (const s of staff) {
      const basic = faker.number.int({ min: 30000, max: 80000 });
      const allowances = Math.round(basic * 0.3);
      const deductions = Math.round(basic * 0.1);

      await repo.save(
        withTenant(
          repo.create({
            month: 9,
            year: 2025,
            basicSalary: basic,
            allowances,
            deductions,
            netSalary: basic + allowances - deductions,
            workingDays: 22,
            presentDays: faker.number.int({ min: 18, max: 22 }),
            status: SalaryStatusEnum.paid,
            paidAt: new Date('2025-09-30'),
            staff: { id: s.id } as StaffEntity,
          }),
        ),
      );
    }
    this.logger.log('  Salary slips seeded (5)');
  }

  private async seedLmsNotices(
    institutionId: number,
    staff: StaffEntity[],
  ): Promise<void> {
    const repo = this.dataSource.getRepository(LmsNoticeEntity);
    const notices = [
      {
        title: 'Annual Sports Day',
        content:
          'The annual sports day will be held on October 25th. All students are encouraged to participate.',
        audience: TargetAudienceEnum.all,
        published: true,
      },
      {
        title: 'Parent-Teacher Meeting',
        content:
          'PTM scheduled for November 5th. Parents are requested to attend.',
        audience: TargetAudienceEnum.parents,
        published: true,
      },
      {
        title: 'Staff Training Workshop',
        content:
          'Mandatory training workshop on new curriculum on November 10th.',
        audience: TargetAudienceEnum.staff,
        published: false,
      },
    ];

    for (let i = 0; i < notices.length; i++) {
      await repo.save(
        withTenant(
          repo.create({
            title: notices[i].title,
            content: notices[i].content,
            targetAudience: notices[i].audience,
            isPublished: notices[i].published,
            publishDate: notices[i].published ? formatDate(new Date()) : null,
            institution: { id: institutionId } as InstitutionEntity,
            publishedBy: { id: staff[0].id } as StaffEntity,
          }),
        ),
      );
    }
    this.logger.log('  LMS Notices seeded (3)');
  }

  private async seedTimetableSlots(
    sections: SectionEntity[],
    subjects: SubjectEntity[],
    staff: StaffEntity[],
  ): Promise<void> {
    const repo = this.dataSource.getRepository(TimetableSlotEntity);
    const days = [
      DayOfWeekEnum.monday,
      DayOfWeekEnum.tuesday,
      DayOfWeekEnum.wednesday,
      DayOfWeekEnum.thursday,
      DayOfWeekEnum.friday,
    ];
    const times = [
      { start: '08:00:00', end: '08:45:00' },
      { start: '09:00:00', end: '09:45:00' },
    ];

    // Create 10 slots for first section
    const section = sections[0];
    let slotCount = 0;
    for (let d = 0; d < days.length && slotCount < 10; d++) {
      for (let t = 0; t < times.length && slotCount < 10; t++) {
        await repo.save(
          withTenant(
            repo.create({
              dayOfWeek: days[d],
              startTime: times[t].start,
              endTime: times[t].end,
              room: `Room ${101 + slotCount}`,
              section: { id: section.id } as SectionEntity,
              subject: {
                id: subjects[slotCount % subjects.length].id,
              } as SubjectEntity,
              staff: {
                id: staff[slotCount % staff.length].id,
              } as StaffEntity,
            }),
          ),
        );
        slotCount++;
      }
    }
    this.logger.log('  Timetable slots seeded (10)');
  }

  private async seedIncome(institutionId: number): Promise<void> {
    const repo = this.dataSource.getRepository(IncomeEntity);
    const categories = ['Tuition Fees', 'Examination Fees', 'Library Fees'];

    for (let i = 0; i < categories.length; i++) {
      await repo.save(
        withTenant(
          repo.create({
            category: categories[i],
            description: `${categories[i]} collection for September 2025`,
            amount: faker.number.int({ min: 50000, max: 200000 }),
            date: '2025-09-30',
            referenceNumber: `FAKE-INC-${String(i + 1).padStart(3, '0')}`,
            receivedFrom: 'Students',
            institution: { id: institutionId } as InstitutionEntity,
          }),
        ),
      );
    }
    this.logger.log('  Income records seeded (3)');
  }

  private async seedExpense(institutionId: number): Promise<void> {
    const repo = this.dataSource.getRepository(ExpenseEntity);
    const expenses = [
      { category: 'Salaries', amount: 500000 },
      { category: 'Utilities', amount: 25000 },
      { category: 'Maintenance', amount: 15000 },
    ];

    for (let i = 0; i < expenses.length; i++) {
      await repo.save(
        withTenant(
          repo.create({
            category: expenses[i].category,
            description: `${expenses[i].category} for September 2025`,
            amount: expenses[i].amount,
            date: '2025-09-30',
            referenceNumber: `FAKE-EXP-${String(i + 1).padStart(3, '0')}`,
            paidTo: faker.company.name(),
            status: ExpenseStatusEnum.paid,
            institution: { id: institutionId } as InstitutionEntity,
          }),
        ),
      );
    }
    this.logger.log('  Expense records seeded (3)');
  }

  private async seedStaffBranchAssignments(
    staffMgmt: StaffMgmtEntity[],
  ): Promise<void> {
    const repo = this.dataSource.getRepository(StaffBranchAssignmentEntity);

    for (const sm of staffMgmt) {
      await repo.save(
        repo.create({
          tenantId: TENANT_ID,
          staffEntityId: sm.id,
          branchId: BRANCH_ID,
          roles: ['staff'],
          isPrimary: true,
          staff: { id: sm.id } as StaffMgmtEntity,
        }),
      );
    }
    this.logger.log('  Staff branch assignments seeded');
  }

  private async seedStaffAttendanceRecords(
    staffMgmt: StaffMgmtEntity[],
  ): Promise<void> {
    const repo = this.dataSource.getRepository(StaffAttendanceRecordEntity);

    for (const sm of staffMgmt) {
      for (let day = 1; day <= 5; day++) {
        await repo.save(
          withTenant(
            repo.create({
              staffId: sm.id,
              date: pastWeekday(day),
              status: AttendanceStatusEnum.present,
              checkInTime: new Date('2025-09-15T08:00:00'),
              remarks: null,
              staff: { id: sm.id } as StaffMgmtEntity,
            }),
          ),
        );
      }
    }
    this.logger.log('  Staff attendance records seeded (10)');
  }

  private async seedStaffLeaveApplications(
    staffMgmt: StaffMgmtEntity[],
  ): Promise<void> {
    const repo = this.dataSource.getRepository(StaffLeaveApplicationEntity);

    if (staffMgmt.length > 0) {
      await repo.save(
        withTenant(
          repo.create({
            staffId: staffMgmt[0].id,
            fromDate: '2025-11-01',
            toDate: '2025-11-03',
            leaveType: LeaveTypeEnum.casual,
            reason: 'Personal work',
            status: LeaveStatusEnum.approved,
            staff: { id: staffMgmt[0].id } as StaffMgmtEntity,
          }),
        ),
      );

      if (staffMgmt.length > 1) {
        await repo.save(
          withTenant(
            repo.create({
              staffId: staffMgmt[1].id,
              fromDate: '2025-11-10',
              toDate: '2025-11-11',
              leaveType: LeaveTypeEnum.sick,
              reason: 'Feeling unwell',
              status: LeaveStatusEnum.pending,
              staff: { id: staffMgmt[1].id } as StaffMgmtEntity,
            }),
          ),
        );
      }
    }
    this.logger.log('  Staff leave applications seeded');
  }

  private async seedStaffLeaveBalances(
    staffMgmt: StaffMgmtEntity[],
  ): Promise<void> {
    const repo = this.dataSource.getRepository(StaffLeaveBalanceEntity);
    const leaveTypes = [
      LeaveTypeEnum.casual,
      LeaveTypeEnum.sick,
      LeaveTypeEnum.earned,
    ];

    for (const sm of staffMgmt) {
      for (const lt of leaveTypes) {
        await repo.save(
          withTenant(
            repo.create({
              staffId: sm.id,
              leaveType: lt,
              totalDays: lt === LeaveTypeEnum.casual ? 12 : 10,
              usedDays: faker.number.int({ min: 0, max: 5 }),
              year: 2025,
              staff: { id: sm.id } as StaffMgmtEntity,
            }),
          ),
        );
      }
    }
    this.logger.log('  Staff leave balances seeded');
  }

  private async seedSalaryStructures(
    staffMgmt: StaffMgmtEntity[],
  ): Promise<SalaryStructureEntity[]> {
    const repo = this.dataSource.getRepository(SalaryStructureEntity);
    const structures: SalaryStructureEntity[] = [];

    for (const sm of staffMgmt) {
      const basic = faker.number.int({ min: 25000, max: 60000 });
      const hra = Math.round(basic * 0.4);
      const ta = 3000;
      const pf = Math.round(basic * 0.12);
      const tax = Math.round(basic * 0.1);

      const structure = await repo.save(
        withTenant(
          repo.create({
            staffId: sm.id,
            name: `Salary Structure - ${sm.staffId}`,
            components: [
              { name: 'Basic Salary', type: 'earning', amount: basic },
              { name: 'HRA', type: 'earning', amount: hra },
              { name: 'Transport Allowance', type: 'earning', amount: ta },
              { name: 'Provident Fund', type: 'deduction', amount: pf },
              { name: 'Income Tax', type: 'deduction', amount: tax },
            ],
            totalEarnings: basic + hra + ta,
            totalDeductions: pf + tax,
            netPay: basic + hra + ta - pf - tax,
            isActive: true,
          }),
        ),
      );
      structures.push(structure);
    }
    this.logger.log('  Salary structures seeded');
    return structures;
  }

  private async seedPayrollSlips(
    staffMgmt: StaffMgmtEntity[],
    structures: SalaryStructureEntity[],
  ): Promise<void> {
    const repo = this.dataSource.getRepository(PayrollSlipEntity);

    for (let i = 0; i < staffMgmt.length; i++) {
      const s = structures[i];
      await repo.save(
        withTenant(
          repo.create({
            staffId: staffMgmt[i].id,
            structureId: s.id,
            month: 9,
            year: 2025,
            breakdown: {
              earnings: (s.components as any[]).filter(
                (c: any) => c.type === 'earning',
              ),
              deductions: (s.components as any[]).filter(
                (c: any) => c.type === 'deduction',
              ),
              totalEarnings: Number(s.totalEarnings),
              totalDeductions: Number(s.totalDeductions),
              netPay: Number(s.netPay),
            },
            totalEarnings: s.totalEarnings,
            totalDeductions: s.totalDeductions,
            netPay: s.netPay,
            workingDays: 22,
            presentDays: faker.number.int({ min: 18, max: 22 }),
            status: SalaryStatusEnum.paid,
            paidAt: new Date('2025-09-30'),
          }),
        ),
      );
    }
    this.logger.log('  Payroll slips seeded');
  }

  private async seedMaterials(subjects: SubjectEntity[]): Promise<void> {
    const repo = this.dataSource.getRepository(MaterialEntity);
    const materialTypes = [
      CourseMaterialTypeEnum.document,
      CourseMaterialTypeEnum.video,
      CourseMaterialTypeEnum.presentation,
    ];

    for (let i = 0; i < 3; i++) {
      await repo.save(
        withTenant(
          repo.create({
            subjectId: subjects[i % subjects.length].id,
            title: `${subjects[i % subjects.length].name} - Study Material ${i + 1}`,
            description: faker.lorem.paragraph(),
            type: materialTypes[i],
            filePath: `/uploads/materials/fake-material-${i + 1}.pdf`,
            fileSize: faker.number.int({ min: 100000, max: 5000000 }),
            version: 1,
            downloadCount: faker.number.int({ min: 0, max: 50 }),
            isActive: true,
          }),
        ),
      );
    }
    this.logger.log('  Materials seeded (3)');
  }

  private async seedAssignments(subjects: SubjectEntity[]): Promise<void> {
    const repo = this.dataSource.getRepository(AssignmentEntity);

    for (let i = 0; i < 2; i++) {
      await repo.save(
        withTenant(
          repo.create({
            subjectId: subjects[i].id,
            title: `${subjects[i].name} Assignment ${i + 1}`,
            description: faker.lorem.paragraph(),
            dueDate: new Date('2025-11-15'),
            totalMarks: 50,
            isActive: true,
          }),
        ),
      );
    }
    this.logger.log('  Assignments seeded (2)');
  }

  private async seedCourseMaterials(
    subjects: SubjectEntity[],
  ): Promise<void> {
    const repo = this.dataSource.getRepository(CourseMaterialEntity);
    const types = [
      CourseMaterialTypeEnum.document,
      CourseMaterialTypeEnum.link,
    ];

    for (let i = 0; i < 2; i++) {
      await repo.save(
        withTenant(
          repo.create({
            title: `${subjects[i].name} Reference Material`,
            type: types[i],
            subject: { id: subjects[i].id } as SubjectEntity,
          }),
        ),
      );
    }
    this.logger.log('  Course materials seeded (2)');
  }

  private async seedStudentGuardians(
    students: StudentEntity[],
  ): Promise<void> {
    const repo = this.dataSource.getRepository(StudentGuardianEntity);

    for (const s of students) {
      await repo.save(
        withTenant(
          repo.create({
            name: faker.person.fullName(),
            phone: faker.phone.number(),
            email: faker.internet.email(),
            relation: faker.helpers.arrayElement([
              'Father',
              'Mother',
              'Guardian',
            ]),
            isPrimary: true,
            student: { id: s.id } as StudentEntity,
          }),
        ),
      );
    }
    this.logger.log('  Student guardians seeded (10)');
  }

  private async seedAdmissionEnquiries(
    institutionId: number,
  ): Promise<void> {
    const repo = this.dataSource.getRepository(AdmissionEnquiryEntity);

    for (let i = 0; i < 3; i++) {
      await repo.save(
        withTenant(
          repo.create({
            studentName: faker.person.fullName(),
            guardianName: faker.person.fullName(),
            phone: faker.phone.number(),
            email: faker.internet.email(),
            gradeApplyingFor: `Grade ${9 + i}`,
            source: faker.helpers.arrayElement([
              EnquirySourceEnum.walk_in,
              EnquirySourceEnum.website,
              EnquirySourceEnum.referral,
            ]),
            status: AdmissionStatusEnum.new,
            notes: faker.lorem.sentence(),
            institution: { id: institutionId } as InstitutionEntity,
          }),
        ),
      );
    }
    this.logger.log('  Admission enquiries seeded (3)');
  }

  private async seedStandaloneNotices(): Promise<void> {
    const repo = this.dataSource.getRepository(StandaloneNoticeEntity);

    const notices = [
      {
        title: 'Welcome to the New Academic Year',
        content: 'We are delighted to welcome all students and staff to the academic year 2025-2026.',
        isPublished: true,
      },
      {
        title: 'Holiday Calendar Released',
        content: 'The holiday calendar for 2025-2026 has been released. Please check the noticeboard.',
        isPublished: true,
      },
      {
        title: 'Upcoming School Event',
        content: 'Details about the upcoming science fair will be shared soon.',
        isPublished: false,
      },
    ];

    for (const n of notices) {
      await repo.save(
        withTenant(
          repo.create({
            title: n.title,
            content: n.content,
            isPublished: n.isPublished,
            publishDate: n.isPublished ? new Date() : null,
            targetBranches: [BRANCH_ID],
            targetRoles: [],
          }),
        ),
      );
    }
    this.logger.log('  Standalone notices seeded (3)');
  }

  private async seedBranchIncome(): Promise<void> {
    const repo = this.dataSource.getRepository(BranchIncomeEntity);
    const categories = [
      'Tuition Fees',
      'Registration Fees',
      'Miscellaneous Income',
    ];

    for (let i = 0; i < categories.length; i++) {
      await repo.save(
        withTenant(
          repo.create({
            category: categories[i],
            description: `${categories[i]} for September 2025`,
            amount: faker.number.int({ min: 10000, max: 100000 }),
            date: '2025-09-30',
            referenceNumber: `FAKE-BI-${String(i + 1).padStart(3, '0')}`,
            receivedFrom: 'Institution',
          }),
        ),
      );
    }
    this.logger.log('  Branch income seeded (3)');
  }

  private async seedBranchExpense(): Promise<void> {
    const repo = this.dataSource.getRepository(BranchExpenseEntity);
    const expenses = [
      { category: 'Office Supplies', amount: 5000 },
      { category: 'Internet & Phone', amount: 8000 },
      { category: 'Building Rent', amount: 50000 },
    ];

    for (let i = 0; i < expenses.length; i++) {
      await repo.save(
        withTenant(
          repo.create({
            category: expenses[i].category,
            description: `${expenses[i].category} for September 2025`,
            amount: expenses[i].amount,
            date: '2025-09-30',
            referenceNumber: `FAKE-BE-${String(i + 1).padStart(3, '0')}`,
            paidTo: faker.company.name(),
            status: ExpenseStatusEnum.approved,
          }),
        ),
      );
    }
    this.logger.log('  Branch expenses seeded (3)');
  }

  // ─── UPDATE OPERATIONS ──────────────────────────────────────────
  // Verify that updation works for each major entity type

  private async updateEntities(
    institution: InstitutionEntity,
    departments: DepartmentEntity[],
    gradeClasses: GradeClassEntity[],
    students: StudentEntity[],
    staff: StaffEntity[],
    feeStructures: FeeStructureEntity[],
    exams: ExamEntity[],
  ): Promise<void> {
    this.logger.log('  Running update operations...');

    // Update institution
    await this.dataSource
      .getRepository(InstitutionEntity)
      .update(institution.id, { website: 'https://sunrise-academy-updated.edu' });

    // Update department
    if (departments.length > 0) {
      await this.dataSource
        .getRepository(DepartmentEntity)
        .update(departments[0].id, { description: 'Updated Science department description' });
    }

    // Update grade class
    if (gradeClasses.length > 0) {
      await this.dataSource
        .getRepository(GradeClassEntity)
        .update(gradeClasses[0].id, { description: 'Updated Grade 9 description' });
    }

    // Update student
    if (students.length > 0) {
      await this.dataSource
        .getRepository(StudentEntity)
        .update(students[0].id, { city: 'Updated City' });
    }

    // Update staff
    if (staff.length > 0) {
      await this.dataSource
        .getRepository(StaffEntity)
        .update(staff[0].id, { designation: 'Updated Senior Teacher' });
    }

    // Update fee structure
    if (feeStructures.length > 0) {
      await this.dataSource
        .getRepository(FeeStructureEntity)
        .update(feeStructures[0].id, { description: 'Updated fee description' });
    }

    // Update exam
    if (exams.length > 0) {
      await this.dataSource
        .getRepository(ExamEntity)
        .update(exams[0].id, { description: 'Updated midterm description' });
    }

    // Update user email (first student user)
    await this.dataSource
      .getRepository(UserEntity)
      .update(
        { email: 'fake-student-1@example.com' },
        { lastName: 'UpdatedLastName' },
      );

    // Update academic year
    await this.dataSource
      .getRepository(AcademicYearEntity)
      .update({ name: '2025-2026' }, { isCurrent: true });

    // Update grading scale
    await this.dataSource
      .getRepository(GradingScaleEntity)
      .update({ name: 'FAKE-Standard Grading' }, { name: 'FAKE-Standard Grading Scale' });

    this.logger.log('  Update operations complete');
  }
}
