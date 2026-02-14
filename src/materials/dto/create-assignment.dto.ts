import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TenantAwareBaseDto } from '../../lms/common/dto/tenant-aware-base.dto';

export class CreateAssignmentDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  subjectId!: number;

  @ApiProperty({ example: 'Algebra Homework 1' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'Solve exercises 1-20' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ example: '2026-03-15T23:59:59Z' })
  @IsDateString()
  dueDate!: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  totalMarks!: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
