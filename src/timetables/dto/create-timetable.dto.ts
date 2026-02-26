import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TenantAwareBaseDto } from '../../lms/common/dto/tenant-aware-base.dto';

export class CreateTimetableDto extends TenantAwareBaseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Branch for this timetable',
  })
  @IsNotEmpty()
  @IsUUID()
  branchId: string;

  @ApiProperty({ type: Number, description: 'Grade class ID' })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  classId: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Section ID (optional)',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sectionId?: number;

  @ApiProperty({ type: Number, description: 'Academic year ID' })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  academicYearId: number;

  @ApiPropertyOptional({ example: 'Class 10-A Timetable' })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
