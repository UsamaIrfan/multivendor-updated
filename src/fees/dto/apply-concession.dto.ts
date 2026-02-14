import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ConcessionTypeEnum } from '../domain/concession-type.enum';

export class ApplyConcessionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  studentId: number;

  @ApiProperty({ enum: ConcessionTypeEnum })
  @IsEnum(ConcessionTypeEnum)
  type: ConcessionTypeEnum;

  @ApiProperty({ example: 25 })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  validTo: string;

  @ApiPropertyOptional({ example: 'Merit scholarship' })
  @IsOptional()
  @IsString()
  reason?: string;
}
