import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MarkEntryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  studentId!: number;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  marksObtained?: number | null;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isAbsent?: boolean;

  @ApiPropertyOptional({ example: 'Medical leave' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class EnterMarksDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  examSubjectId!: number;

  @ApiProperty({ type: [MarkEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkEntryDto)
  results!: MarkEntryDto[];
}
