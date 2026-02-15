import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';
import { ExpenseStatusEnum } from '../../lms/common/enums/general.enum';

export class BranchExpense extends LmsBaseDomain {
  declare id: any; // UUID

  @ApiProperty({ example: 'Utilities' })
  category!: string;

  @ApiPropertyOptional({ example: 'Electricity bill for January' })
  description!: string | null;

  @ApiProperty({ example: 25000.0 })
  amount!: number;

  @ApiProperty({ example: '2025-01-20' })
  date!: Date;

  @ApiPropertyOptional({ example: 'REF-EXP-001' })
  referenceNumber!: string | null;

  @ApiPropertyOptional({ example: 'WAPDA' })
  paidTo!: string | null;

  @ApiProperty({ enum: ExpenseStatusEnum })
  status!: ExpenseStatusEnum;

  @ApiPropertyOptional({ example: 'Monthly bill' })
  remarks!: string | null;
}
