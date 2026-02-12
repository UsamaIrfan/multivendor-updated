import { ApiProperty } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { EmploymentTypeEnum } from '../../common/enums/general.enum';

export class Staff extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: 1 })
  institutionId!: number;

  @ApiProperty({ example: 1, nullable: true })
  departmentId!: number | null;

  @ApiProperty({ example: 'EMP-001' })
  employeeId!: string;

  @ApiProperty({ example: 'Senior Lecturer', nullable: true })
  designation!: string | null;

  @ApiProperty({ example: 'PhD in Computer Science', nullable: true })
  qualification!: string | null;

  @ApiProperty({ example: 'Machine Learning', nullable: true })
  specialization!: string | null;

  @ApiProperty({ example: 5, nullable: true })
  experienceYears!: number | null;

  @ApiProperty({ example: '2023-01-15', nullable: true })
  joiningDate!: Date | null;

  @ApiProperty({ example: 50000 })
  basicSalary!: number;

  @ApiProperty({ enum: EmploymentTypeEnum })
  employmentType!: EmploymentTypeEnum;

  @ApiProperty({ example: '+1234567890', nullable: true })
  emergencyContact!: string | null;

  @ApiProperty({ example: '123 Main Street', nullable: true })
  address!: string | null;
}
