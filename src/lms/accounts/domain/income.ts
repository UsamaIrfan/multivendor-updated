import { ApiProperty } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';

export class Income extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  institutionId!: number;

  @ApiProperty({ example: 1, nullable: true })
  feePaymentId!: number | null;

  @ApiProperty({ example: 'Tuition' })
  category!: string;

  @ApiProperty({ example: 'Monthly tuition fee collection', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 50000 })
  amount!: number;

  @ApiProperty({ example: '2025-01-15' })
  date!: Date;

  @ApiProperty({ example: 'REF-001', nullable: true })
  referenceNumber!: string | null;

  @ApiProperty({ example: 'John Doe', nullable: true })
  receivedFrom!: string | null;

  @ApiProperty({ example: 'First semester fees', nullable: true })
  remarks!: string | null;
}
