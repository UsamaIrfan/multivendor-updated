import { ApiProperty } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { SalaryStatusEnum } from '../../common/enums/general.enum';

export class SalarySlip extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  staffId!: number;

  @ApiProperty({ example: 1 })
  month!: number;

  @ApiProperty({ example: 2024 })
  year!: number;

  @ApiProperty({ example: 50000 })
  basicSalary!: number;

  @ApiProperty({ example: 10000 })
  allowances!: number;

  @ApiProperty({ example: 5000 })
  deductions!: number;

  @ApiProperty({ example: 55000 })
  netSalary!: number;

  @ApiProperty({ example: 22 })
  workingDays!: number;

  @ApiProperty({ example: 20 })
  presentDays!: number;

  @ApiProperty({ enum: SalaryStatusEnum })
  status!: SalaryStatusEnum;

  @ApiProperty({ example: '2024-01-31', nullable: true })
  paidAt!: Date | null;

  @ApiProperty({ example: 'Salary for January', nullable: true })
  remarks!: string | null;
}
