import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateIncomeDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  institutionId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  feePaymentId?: number | null;

  @ApiProperty({ example: 'Tuition Fee' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'Monthly tuition fee collection' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '2025-07-01' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'REF-001' })
  @IsOptional()
  @IsString()
  referenceNumber?: string | null;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  receivedFrom?: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}
