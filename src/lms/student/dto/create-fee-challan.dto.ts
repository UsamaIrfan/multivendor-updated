import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentStatusEnum } from '../../common/enums/payment-status.enum';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateFeeChallanDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  studentId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  feeStructureId: number;

  @ApiProperty({ example: 'CHN-2025-0001' })
  @IsNotEmpty()
  @IsString()
  challanNumber: string;

  @ApiProperty({ example: 5000.0 })
  @IsNumber()
  totalAmount: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty({ example: '2025-07-15' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ example: '2025-06-15' })
  @IsOptional()
  @IsDateString()
  issueDate?: string | null;

  @ApiPropertyOptional({
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.pending,
  })
  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  status?: PaymentStatusEnum;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}
