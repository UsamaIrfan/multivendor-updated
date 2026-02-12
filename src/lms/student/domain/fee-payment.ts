import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { PaymentMethodEnum } from '../../common/enums/payment-status.enum';

export class FeePayment extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  feeChallanId!: number;

  @ApiProperty({ type: Number })
  amount!: number;

  @ApiProperty({ enum: PaymentMethodEnum })
  method!: PaymentMethodEnum;

  @ApiPropertyOptional({ type: String })
  transactionRef!: string | null;

  @ApiPropertyOptional({ type: String })
  receiptNumber!: string | null;

  @ApiPropertyOptional({ type: Date })
  paidAt!: Date | null;

  @ApiPropertyOptional({ type: String })
  remarks!: string | null;
}
