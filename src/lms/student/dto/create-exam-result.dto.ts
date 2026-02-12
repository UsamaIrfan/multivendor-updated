import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateExamResultDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  examSubjectId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  studentId: number;

  @ApiPropertyOptional({ example: 85.5 })
  @IsOptional()
  @IsNumber()
  marksObtained?: number | null;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  grade?: string | null;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isAbsent?: boolean;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}
