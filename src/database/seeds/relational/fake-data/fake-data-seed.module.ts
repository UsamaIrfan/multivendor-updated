import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FakeDataSeedService } from './fake-data-seed.service';

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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Infrastructure
      UserEntity,
      // LMS Courses
      InstitutionEntity,
      DepartmentEntity,
      GradeClassEntity,
      SectionEntity,
      SubjectEntity,
      // LMS Academic
      AcademicYearEntity,
      TermEntity,
      // LMS Student
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
      // LMS Staff
      StaffEntity,
      StaffAttendanceEntity,
      StaffLeaveEntity,
      SalarySlipEntity,
      LmsNoticeEntity,
      TimetableSlotEntity,
      // LMS Accounts
      IncomeEntity,
      ExpenseEntity,
      // Staff Management
      StaffMgmtEntity,
      StaffBranchAssignmentEntity,
      // Staff Attendance Module
      StaffAttendanceRecordEntity,
      StaffLeaveApplicationEntity,
      StaffLeaveBalanceEntity,
      // Payroll
      SalaryStructureEntity,
      PayrollSlipEntity,
      // Materials
      MaterialEntity,
      AssignmentEntity,
      // Exams
      GradingScaleEntity,
      // Fees
      ConcessionEntity,
      ReceiptEntity,
      // Student Registration
      StudentGuardianEntity,
      // Standalone Notices
      StandaloneNoticeEntity,
      // Branch Income/Expense
      BranchIncomeEntity,
      BranchExpenseEntity,
    ]),
  ],
  providers: [FakeDataSeedService],
  exports: [FakeDataSeedService],
})
export class FakeDataSeedModule {}
