import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TenantContextService } from '../tenant/tenant-context/tenant-context.service';
import { TenantRepository } from '../tenant/infrastructure/persistence/tenant.repository';
import { BranchRepository } from '../tenant/infrastructure/persistence/branch.repository';
import { StaffBranchAssignmentRepository } from '../staff-management/infrastructure/persistence/staff-branch-assignment.repository';
import { StudentRepository } from '../lms/student/infrastructure/persistence/student.repository';
import { StudentEnrollmentRepository } from '../lms/student/infrastructure/persistence/student-enrollment.repository';
import { StudentAttendanceRepository } from '../lms/student/infrastructure/persistence/student-attendance.repository';
import { FeeChallanRepository } from '../lms/student/infrastructure/persistence/fee-challan.repository';
import { ExamRepository } from '../lms/student/infrastructure/persistence/exam.repository';
import { ExamResultRepository } from '../lms/student/infrastructure/persistence/exam-result.repository';
import { SectionRepository } from '../lms/courses/infrastructure/persistence/section.repository';
import { GradeClassRepository } from '../lms/courses/infrastructure/persistence/grade-class.repository';
import { AcademicYearRepository } from '../lms/academic/infrastructure/persistence/academic-year.repository';
import { AttendanceStatusEnum } from '../lms/common/enums/attendance-status.enum';
import {
  StudentDashboard,
  StaffDashboard,
  DashboardAttendanceSummary,
  DashboardFeeSummary,
  DashboardExamSummary,
  DashboardStudentProfile,
  StaffBranchData,
  BranchInfo,
} from './domain/dashboard';

@Injectable()
export class PortalsService {
  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly tenantRepo: TenantRepository,
    private readonly branchRepo: BranchRepository,
    private readonly staffBranchRepo: StaffBranchAssignmentRepository,
    private readonly studentRepo: StudentRepository,
    private readonly enrollmentRepo: StudentEnrollmentRepository,
    private readonly attendanceRepo: StudentAttendanceRepository,
    private readonly feeChallanRepo: FeeChallanRepository,
    private readonly examRepo: ExamRepository,
    private readonly examResultRepo: ExamResultRepository,
    private readonly sectionRepo: SectionRepository,
    private readonly gradeClassRepo: GradeClassRepository,
    private readonly academicYearRepo: AcademicYearRepository,
  ) {}

  async getStudentDashboard(
    userId: number,
    branchId?: string,
  ): Promise<StudentDashboard> {
    const tenantId = this.tenantContext.getTenantId();

    const tenant = await this.tenantRepo.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const effectiveBranchId =
      branchId ?? this.tenantContext.getBranchId() ?? null;

    let branchName = 'All Branches';
    if (effectiveBranchId) {
      const branch = await this.branchRepo.findById(effectiveBranchId);
      if (branch) branchName = branch.name;
    }

    // ── Student Profile ──
    const student = await this.studentRepo.findByUserId(userId);
    let studentProfile: DashboardStudentProfile | null = null;
    let gradeClassName = '';
    let sectionName = '';
    let academicYearName = '';

    if (student) {
      // Get enrollment for class/section/academic year info
      const allEnrollments = await this.enrollmentRepo.findAll();
      const activeEnrollment = allEnrollments.find(
        (e) => e.studentId === student.id && e.status === 'active',
      );

      if (activeEnrollment) {
        // Resolve section → gradeClass name + section name
        const section = await this.sectionRepo.findById(
          activeEnrollment.sectionId,
        );
        if (section) {
          sectionName = section.name;
          const gradeClass = await this.gradeClassRepo.findById(
            section.gradeClassId,
          );
          if (gradeClass) {
            gradeClassName = gradeClass.name;
          }
        }

        // Resolve academic year name
        const academicYear = await this.academicYearRepo.findById(
          activeEnrollment.academicYearId,
        );
        if (academicYear) {
          academicYearName = academicYear.name;
        }
      }

      studentProfile = {
        id: student.id,
        firstName: student.firstName ?? null,
        lastName: student.lastName ?? null,
        studentId: student.rollNumber,
        photo: null,
        gradeClass: gradeClassName ? { name: gradeClassName } : null,
        section: sectionName ? { name: sectionName } : null,
        academicYear: academicYearName ? { name: academicYearName } : null,
      };
    }

    // ── Attendance Summary ──
    let attendance: DashboardAttendanceSummary = {
      attendancePercentage: 0,
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
    };

    if (student) {
      const allAttendance = await this.attendanceRepo.findAll();
      const studentAttendance = allAttendance.filter(
        (a) => a.studentId === student.id,
      );

      const totalDays = studentAttendance.length;
      const presentDays = studentAttendance.filter(
        (a) => a.status === AttendanceStatusEnum.present,
      ).length;
      const absentDays = studentAttendance.filter(
        (a) => a.status === AttendanceStatusEnum.absent,
      ).length;
      const lateDays = studentAttendance.filter(
        (a) => a.status === AttendanceStatusEnum.late,
      ).length;

      attendance = {
        attendancePercentage:
          totalDays > 0
            ? Math.round(((presentDays + lateDays) / totalDays) * 1000) / 10
            : 0,
        totalDays,
        presentDays,
        absentDays,
        lateDays,
      };
    }

    // ── Fees Summary ──
    let fees: DashboardFeeSummary = {
      totalFees: 0,
      paidAmount: 0,
      pendingAmount: 0,
      nextDueDate: null,
      nextDueAmount: null,
    };

    if (student) {
      const challans = await this.feeChallanRepo.findByStudentId(student.id);
      const totalFees = challans.reduce((s, c) => s + (c.totalAmount ?? 0), 0);
      const paidAmount = challans.reduce((s, c) => s + (c.paidAmount ?? 0), 0);
      const pendingAmount = totalFees - paidAmount;

      // Find next due challan
      const now = new Date();
      const pendingChallans = challans
        .filter(
          (c) => c.status !== 'paid' && c.dueDate && new Date(c.dueDate) >= now,
        )
        .sort(
          (a, b) =>
            new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
        );

      fees = {
        totalFees,
        paidAmount,
        pendingAmount,
        nextDueDate: pendingChallans[0]?.dueDate
          ? new Date(pendingChallans[0].dueDate).toISOString().split('T')[0]!
          : null,
        nextDueAmount: pendingChallans[0]
          ? (pendingChallans[0].totalAmount ?? 0) -
            (pendingChallans[0].paidAmount ?? 0)
          : null,
      };
    }

    // ── Exams Summary ──
    let exams: DashboardExamSummary = {
      upcomingExams: 0,
      lastExamPercentage: null,
    };

    if (student) {
      const allExams = await this.examRepo.findAll();
      const now = new Date();
      const upcomingCount = allExams.filter(
        (e) => e.startDate && new Date(e.startDate) > now,
      ).length;

      // Get latest exam result
      const results = await this.examResultRepo.findByStudentId(student.id);
      const lastResult =
        results.length > 0 ? results[results.length - 1] : null;

      exams = {
        upcomingExams: upcomingCount,
        lastExamPercentage: lastResult?.percentage ?? null,
      };
    }

    return {
      tenant: {
        name: tenant.name,
        logoUrl: (tenant.settings as any)?.logoUrl ?? null,
      },
      branch: branchName,
      student: studentProfile,
      attendance,
      fees,
      exams,
    };
  }

  async getStaffDashboard(
    userId: number,
    branchId?: string,
  ): Promise<StaffDashboard> {
    const tenantId = this.tenantContext.getTenantId();

    const tenant = await this.tenantRepo.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Get all branch assignments for this staff user
    const assignments = await this.staffBranchRepo.findByUserAndTenant(
      userId,
      tenantId,
    );

    const allBranches: StaffBranchData[] = [];
    let primaryBranch: BranchInfo | null = null;

    for (const assignment of assignments) {
      // Filter by specific branch if provided
      if (branchId && assignment.branchId !== branchId) continue;

      const branch = await this.branchRepo.findById(assignment.branchId);
      if (!branch) continue;

      const branchInfo: BranchInfo = {
        id: branch.id,
        name: branch.name,
        isPrimary: assignment.isPrimary,
      };

      if (assignment.isPrimary) {
        primaryBranch = branchInfo;
      }

      const branchAttendance: DashboardAttendanceSummary = {
        attendancePercentage: 0,
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
      };

      allBranches.push({
        branch: branchInfo,
        assignedClasses: 0,
        attendance: branchAttendance,
      });
    }

    const totalAssignedClasses = allBranches.reduce(
      (sum, b) => sum + b.assignedClasses,
      0,
    );

    const overallAttendance: DashboardAttendanceSummary = {
      attendancePercentage: 0,
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
    };

    return {
      tenant: {
        name: tenant.name,
        logoUrl: (tenant.settings as any)?.logoUrl ?? null,
      },
      primaryBranch,
      allBranches,
      totalAssignedClasses,
      attendance: overallAttendance,
    };
  }

  async switchBranch(
    userId: number,
    tenantId: string,
    branchId: string,
  ): Promise<{ branchId: string; branchName: string }> {
    // Verify branch exists and belongs to tenant
    const branch = await this.branchRepo.findById(branchId);
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Verify user has access to this branch
    const assignments = await this.staffBranchRepo.findByUserAndTenant(
      userId,
      tenantId,
    );

    const hasAccess = assignments.some((a) => a.branchId === branchId);
    if (!hasAccess) {
      throw new ForbiddenException('User does not have access to this branch');
    }

    return {
      branchId: branch.id,
      branchName: branch.name,
    };
  }
}
