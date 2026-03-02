import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';
import { EmploymentTypeEnum } from '../../lms/common/enums/general.enum';
import { StaffBranchAssignment } from './staff-branch-assignment';

export class StaffMgmt extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: 1 })
  institutionId!: number;

  @ApiPropertyOptional({ example: 1, nullable: true })
  departmentId!: number | null;

  @ApiProperty({ example: 'abc-edu-STF-2026-0001' })
  staffId!: string;

  @ApiPropertyOptional({ type: String, format: 'uuid', nullable: true })
  primaryBranchId!: string | null;

  @ApiPropertyOptional({ example: 'Senior Teacher', nullable: true })
  designation!: string | null;

  @ApiPropertyOptional({ example: 'M.Ed', nullable: true })
  qualification!: string | null;

  @ApiPropertyOptional({ example: 'Mathematics', nullable: true })
  specialization!: string | null;

  @ApiPropertyOptional({ example: 5, nullable: true })
  experienceYears!: number | null;

  @ApiPropertyOptional({ example: '2024-01-15', nullable: true })
  joiningDate!: Date | null;

  @ApiProperty({ example: 50000 })
  basicSalary!: number;

  @ApiProperty({ enum: EmploymentTypeEnum })
  employmentType!: EmploymentTypeEnum;

  @ApiPropertyOptional({ example: '+1234567890', nullable: true })
  emergencyContact!: string | null;

  @ApiPropertyOptional({ example: '123 Main Street', nullable: true })
  address!: string | null;

  @ApiPropertyOptional({ type: () => [StaffBranchAssignment] })
  branchAssignments?: StaffBranchAssignment[];
}
