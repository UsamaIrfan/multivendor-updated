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
import { ExpenseStatusEnum } from '../../common/enums/general.enum';

export class CreateExpenseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  institutionId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  salarySlipId?: number | null;

  @ApiProperty({ example: 'Stationery' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'Purchase of office supplies' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '2025-07-01' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'REF-EXP-001' })
  @IsOptional()
  @IsString()
  referenceNumber?: string | null;

  @ApiPropertyOptional({ example: 'Supplier XYZ' })
  @IsOptional()
  @IsString()
  paidTo?: string | null;

  @ApiPropertyOptional({
    enum: ExpenseStatusEnum,
    default: ExpenseStatusEnum.pending,
  })
  @IsOptional()
  @IsEnum(ExpenseStatusEnum)
  status?: ExpenseStatusEnum;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}
