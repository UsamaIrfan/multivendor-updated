import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';

export class Receipt extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  paymentId!: number;

  @ApiProperty({ type: String })
  receiptNumber!: string;

  @ApiProperty({ type: Number })
  amount!: number;

  @ApiPropertyOptional({ type: String })
  studentName!: string | null;

  @ApiPropertyOptional({ type: String })
  challanNumber!: string | null;

  @ApiPropertyOptional({ type: String })
  paymentMethod!: string | null;

  @ApiProperty({ type: Date })
  issuedAt!: Date;
}
