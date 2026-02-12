import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAcademicYearDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  institutionId!: number;

  @ApiProperty({ example: '2025-2026' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: '2025-04-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-03-31' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}
