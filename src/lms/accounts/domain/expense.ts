import { ApiProperty } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { ExpenseStatusEnum } from '../../common/enums/general.enum';

export class Expense extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  institutionId!: number;

  @ApiProperty({ example: 1, nullable: true })
  salarySlipId!: number | null;

  @ApiProperty({ example: 'Utilities' })
  category!: string;

  @ApiProperty({ example: 'Electricity bill for January', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 25000 })
  amount!: number;

  @ApiProperty({ example: '2025-01-20' })
  date!: Date;

  @ApiProperty({ example: 'REF-EXP-001', nullable: true })
  referenceNumber!: string | null;

  @ApiProperty({ example: 'WAPDA', nullable: true })
  paidTo!: string | null;

  @ApiProperty({ enum: ExpenseStatusEnum })
  status!: ExpenseStatusEnum;

  @ApiProperty({ example: 'Monthly bill', nullable: true })
  remarks!: string | null;
}
