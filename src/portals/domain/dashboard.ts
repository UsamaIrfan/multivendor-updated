import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardAttendanceSummary {
  @ApiProperty({ example: 90.5 })
  attendancePercentage: number;

  @ApiProperty({ example: 20 })
  totalDays: number;

  @ApiProperty({ example: 18 })
  presentDays: number;

  @ApiProperty({ example: 2 })
  absentDays: number;
}

export class DashboardFeeSummary {
  @ApiProperty({ example: 50000 })
  totalFees: number;

  @ApiProperty({ example: 30000 })
  paidAmount: number;

  @ApiProperty({ example: 20000 })
  pendingAmount: number;

  @ApiPropertyOptional({ example: '2026-03-01' })
  nextDueDate: string | null;
}

export class DashboardExamSummary {
  @ApiProperty({ example: 2 })
  upcomingExams: number;

  @ApiPropertyOptional({ example: 85.5 })
  lastExamPercentage: number | null;
}

export class BranchInfo {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Main Campus' })
  name: string;

  @ApiProperty({ example: true })
  isPrimary: boolean;
}

export class StudentDashboard {
  @ApiProperty()
  tenant: { name: string; logoUrl: string | null };

  @ApiProperty()
  branch: string;

  @ApiProperty()
  attendance: DashboardAttendanceSummary;

  @ApiProperty()
  fees: DashboardFeeSummary;

  @ApiProperty()
  exams: DashboardExamSummary;
}

export class StaffBranchData {
  @ApiProperty()
  branch: BranchInfo;

  @ApiProperty({ example: 5 })
  assignedClasses: number;

  @ApiProperty()
  attendance: DashboardAttendanceSummary;
}

export class StaffDashboard {
  @ApiProperty()
  tenant: { name: string; logoUrl: string | null };

  @ApiProperty()
  primaryBranch: BranchInfo | null;

  @ApiProperty({ type: [StaffBranchData] })
  allBranches: StaffBranchData[];

  @ApiProperty({ example: 3 })
  totalAssignedClasses: number;

  @ApiProperty()
  attendance: DashboardAttendanceSummary;
}
