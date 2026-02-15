import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';

/**
 * Represents an individual salary component (earning or deduction).
 */
export class SalaryComponent {
  @ApiProperty({ example: 'Basic Salary' })
  name: string;

  @ApiProperty({ enum: ['earning', 'deduction'], example: 'earning' })
  type: 'earning' | 'deduction';

  @ApiProperty({ example: 50000 })
  amount: number;
}

/**
 * Salary structure — defines tenant-specific salary components for a staff member.
 * branchId = null means the structure applies to all branches.
 */
export class SalaryStructure extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  staffId!: number;

  @ApiProperty({ example: 'Standard Teacher Structure' })
  name!: string;

  @ApiProperty({ type: [SalaryComponent] })
  components!: SalaryComponent[];

  @ApiProperty({ example: 65000, description: 'Sum of all earnings' })
  totalEarnings!: number;

  @ApiProperty({ example: 5500, description: 'Sum of all deductions' })
  totalDeductions!: number;

  @ApiProperty({
    example: 59500,
    description: 'Net pay = earnings - deductions',
  })
  netPay!: number;

  @ApiPropertyOptional({ example: true })
  isActive!: boolean;
}
