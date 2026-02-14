import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExamTypeEnum } from '../../lms/common/enums/exam.enum';

export class ExamSubjectInputDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  subjectId!: number;

  @ApiPropertyOptional({ example: '2026-03-15' })
  @IsOptional()
  @IsDateString()
  examDate?: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  totalMarks!: number;

  @ApiProperty({ example: 35 })
  @IsNumber()
  @Min(0)
  passingMarks!: number;
}

export class CreateExamScheduleDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  termId!: number;

  @ApiProperty({ example: 'Mid-Term Examination 2026' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ enum: ExamTypeEnum, default: ExamTypeEnum.midterm })
  @IsOptional()
  @IsEnum(ExamTypeEnum)
  type?: ExamTypeEnum;

  @ApiProperty({ example: '2026-03-15' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-03-25' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: 'Mid-term exams for all subjects' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [ExamSubjectInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamSubjectInputDto)
  subjects?: ExamSubjectInputDto[];
}
