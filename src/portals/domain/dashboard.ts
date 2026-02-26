import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardStudentProfile {
  @ApiProperty({ example: 65 })
  id: number;

  @ApiPropertyOptional({ example: 'Sheila' })
  firstName: string | null;

  @ApiPropertyOptional({ example: 'Cooper' })
  lastName: string | null;

  @ApiPropertyOptional({ example: 'STU-2026-0001' })
  studentId: string;

  @ApiPropertyOptional()
  photo: { path?: string } | null;

  @ApiPropertyOptional()
  gradeClass: { name: string } | null;

  @ApiPropertyOptional()
  section: { name: string } | null;

  @ApiPropertyOptional()
  academicYear: { name: string } | null;
}

export class DashboardAttendanceSummary {
  @ApiProperty({ example: 90.5 })
  attendancePercentage: number;

  @ApiProperty({ example: 20 })
  totalDays: number;

  @ApiProperty({ example: 18 })
  presentDays: number;

  @ApiProperty({ example: 2 })
  absentDays: number;

  @ApiProperty({ example: 1 })
  lateDays: number;
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

  @ApiPropertyOptional({ example: 15000 })
  nextDueAmount: number | null;
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

  @ApiPropertyOptional({ type: DashboardStudentProfile })
  student: DashboardStudentProfile | null;

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
