import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentMethodEnum } from '../../lms/common/enums/payment-status.enum';

export class RecordPaymentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  challanId: number;

  @ApiProperty({ example: 12500 })
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

  @ApiPropertyOptional({ example: '2026-07-01T10:30:00Z' })
  @IsOptional()
  @IsDateString()
  paidAt?: string | null;

  @ApiPropertyOptional({ example: 'Q1 payment' })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}
