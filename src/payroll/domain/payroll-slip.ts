import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';
import { SalaryStatusEnum } from '../../lms/common/enums/general.enum';
import { SalaryComponent } from './salary-structure';

/**
 * Breakdown of a salary slip — contains computed earnings, deductions, and net pay.
 */
export class SalaryBreakdown {
  @ApiProperty({ type: [SalaryComponent] })
  earnings: SalaryComponent[];

  @ApiProperty({ type: [SalaryComponent] })
  deductions: SalaryComponent[];

  @ApiProperty({ example: 65000 })
  totalEarnings: number;

  @ApiProperty({ example: 5500 })
  totalDeductions: number;

  @ApiProperty({ example: 59500 })
  netPay: number;
}

/**
 * Salary slip — a processed payroll record for one staff member in one month/year.
 * Unique per (tenantId, staffId, month, year).
 */
export class PayrollSlip extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  staffId!: number;

  @ApiProperty({ example: 1 })
  structureId!: number;

  @ApiProperty({ example: 1, description: 'Month (1-12)' })
  month!: number;

  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ type: SalaryBreakdown })
  breakdown!: SalaryBreakdown;

  @ApiProperty({ example: 65000 })
  totalEarnings!: number;

  @ApiProperty({ example: 5500 })
  totalDeductions!: number;

  @ApiProperty({ example: 59500 })
  netPay!: number;

  @ApiProperty({ example: 22 })
  workingDays!: number;

  @ApiProperty({ example: 20 })
  presentDays!: number;

  @ApiProperty({ enum: SalaryStatusEnum })
  status!: SalaryStatusEnum;

  @ApiPropertyOptional({ example: '2026-01-31', nullable: true })
  paidAt!: Date | null;

  @ApiPropertyOptional({ example: 'January 2026 salary', nullable: true })
  remarks!: string | null;
}
