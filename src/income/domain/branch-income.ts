import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';

export class BranchIncome extends LmsBaseDomain {
  declare id: any; // UUID

  @ApiProperty({ example: 'Tuition' })
  category!: string;

  @ApiPropertyOptional({ example: 'Monthly tuition fee collection' })
  description!: string | null;

  @ApiProperty({ example: 50000.0 })
  amount!: number;

  @ApiProperty({ example: '2025-01-15' })
  date!: Date;

  @ApiPropertyOptional({ example: 'REF-2025-001' })
  referenceNumber!: string | null;

  @ApiPropertyOptional({ example: 'John Doe' })
  receivedFrom!: string | null;

  @ApiPropertyOptional({ example: 'First semester fees' })
  remarks!: string | null;
}
