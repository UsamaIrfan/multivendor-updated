import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  GenderEnum,
  BloodGroupEnum,
} from '../../lms/common/enums/general.enum';

export class UpdateRegisteredStudentDto {
  // ─── User account fields ─────────────────────────────
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+1555000001' })
  @IsOptional()
  @IsString()
  phone?: string | null;

  // ─── Student profile fields ──────────────────────────
  @ApiPropertyOptional({ example: '456 Oak Street' })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional({ example: 'Springfield' })
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiPropertyOptional({ enum: GenderEnum })
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum | null;

  @ApiPropertyOptional({ enum: BloodGroupEnum })
  @IsOptional()
  @IsEnum(BloodGroupEnum)
  bloodGroup?: BloodGroupEnum | null;

  @ApiPropertyOptional({ example: 'American' })
  @IsOptional()
  @IsString()
  nationality?: string | null;

  @ApiPropertyOptional({ example: 'Christian' })
  @IsOptional()
  @IsString()
  religion?: string | null;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  guardianName?: string | null;

  @ApiPropertyOptional({ example: '+1555000002' })
  @IsOptional()
  @IsString()
  guardianPhone?: string | null;

  @ApiPropertyOptional({ example: 'guardian@example.com' })
  @IsOptional()
  @IsString()
  guardianEmail?: string | null;

  @ApiPropertyOptional({ example: 'Mother' })
  @IsOptional()
  @IsString()
  guardianRelation?: string | null;

  @ApiPropertyOptional({ example: '2012-05-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string | null;

  @ApiPropertyOptional({ example: '2025-04-01' })
  @IsOptional()
  @IsDateString()
  admissionDate?: string | null;

  // ─── Institution ─────────────────────────────────────
  @ApiPropertyOptional({ example: 1, description: 'Institution ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  institutionId?: number;

  // ─── Enrollment (class/section) ──────────────────────
  @ApiPropertyOptional({
    example: 1,
    description: 'Section ID — updates active enrollment',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sectionId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Academic Year ID — updates active enrollment',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  academicYearId?: number;

  // ─── Emergency contact ───────────────────────────────
  @ApiPropertyOptional({ example: 'John Smith' })
  @IsOptional()
  @IsString()
  emergencyContactName?: string | null;

  @ApiPropertyOptional({ example: '+1555000003' })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string | null;

  @ApiPropertyOptional({ example: 'Uncle' })
  @IsOptional()
  @IsString()
  emergencyContactRelation?: string | null;
}
