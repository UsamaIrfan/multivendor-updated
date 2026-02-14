import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FeeFrequencyEnum } from '../../lms/common/enums/payment-status.enum';

export class InstallmentDto {
  @ApiProperty({ example: 'Q1' })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({ example: 12500 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  dueDate: string;
}

export class CreateFeeStructureDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  institutionId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  gradeClassId?: number | null;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  academicYearId?: number | null;

  @ApiProperty({ example: 'Tuition Fee' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    enum: FeeFrequencyEnum,
    default: FeeFrequencyEnum.annual,
  })
  @IsOptional()
  @IsEnum(FeeFrequencyEnum)
  frequency?: FeeFrequencyEnum;

  @ApiPropertyOptional({ example: 'Annual tuition fee' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ type: [InstallmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstallmentDto)
  installments?: InstallmentDto[];
}
