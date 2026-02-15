import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TenantContextService } from '../tenant/tenant-context/tenant-context.service';
import { TenantRepository } from '../tenant/infrastructure/persistence/tenant.repository';
import { BranchRepository } from '../tenant/infrastructure/persistence/branch.repository';
import { StaffBranchAssignmentRepository } from '../staff-management/infrastructure/persistence/staff-branch-assignment.repository';
import {
  StudentDashboard,
  StaffDashboard,
  DashboardAttendanceSummary,
  DashboardFeeSummary,
  DashboardExamSummary,
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

    // Aggregated summary — in production these would query real repos
    const attendance: DashboardAttendanceSummary = {
      attendancePercentage: 0,
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
    };

    const fees: DashboardFeeSummary = {
      totalFees: 0,
      paidAmount: 0,
      pendingAmount: 0,
      nextDueDate: null,
    };

    const exams: DashboardExamSummary = {
      upcomingExams: 0,
      lastExamPercentage: null,
    };

    return {
      tenant: {
        name: tenant.name,
        logoUrl: (tenant.settings as any)?.logoUrl ?? null,
      },
      branch: branchName,
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
