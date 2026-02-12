import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentMethodEnum } from '../../common/enums/payment-status.enum';

export class CreateFeePaymentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  feeChallanId: number;

  @ApiProperty({ example: 2500.0 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    enum: PaymentMethodEnum,
    default: PaymentMethodEnum.cash,
  })
  @IsOptional()
  @IsEnum(PaymentMethodEnum)
  method?: PaymentMethodEnum;

  @ApiPropertyOptional({ example: 'TXN-12345' })
  @IsOptional()
  @IsString()
  transactionRef?: string | null;

  @ApiPropertyOptional({ example: 'REC-001' })
  @IsOptional()
  @IsString()
  receiptNumber?: string | null;

  @ApiPropertyOptional({ example: '2025-07-01T10:30:00Z' })
  @IsOptional()
  @IsDateString()
  paidAt?: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}
