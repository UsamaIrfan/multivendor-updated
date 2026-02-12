import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { PaymentStatusEnum } from '../../common/enums/payment-status.enum';

export class FeeChallan extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  studentId!: number;

  @ApiProperty({ type: Number })
  feeStructureId!: number;

  @ApiProperty({ type: String })
  challanNumber!: string;

  @ApiProperty({ type: Number })
  totalAmount!: number;

  @ApiProperty({ type: Number })
  paidAmount!: number;

  @ApiProperty({ type: Number })
  discount!: number;

  @ApiProperty({ type: Date })
  dueDate!: Date;

  @ApiPropertyOptional({ type: Date })
  issueDate!: Date | null;

  @ApiProperty({ enum: PaymentStatusEnum })
  status!: PaymentStatusEnum;

  @ApiPropertyOptional({ type: String })
  remarks!: string | null;
}
