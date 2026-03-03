import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {
  GenderEnum,
  BloodGroupEnum,
} from '../../lms/common/enums/general.enum';

export class RegisterStudentDto {
  // ─── Draft flag ──────────────────────────────────────
  @ApiPropertyOptional({
    example: false,
    description: 'When true, only firstName, email & institutionId are required',
  })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  // ─── User account fields ─────────────────────────────
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'student@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secret123!' })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  // ─── Student fields ──────────────────────────────────
  @ApiProperty({ example: 1, description: 'Institution ID' })
  @IsInt()
  institutionId: number;

  @ApiProperty({ example: '2012-05-15' })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: GenderEnum, example: 'male' })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  @IsEnum(GenderEnum)
  gender: GenderEnum;

  // ─── Optional enrollment fields ──────────────────────
  @ApiPropertyOptional({
    example: 1,
    description: 'Section ID — if provided with academicYearId, the student will be auto-enrolled',
  })
  @IsOptional()
  @IsInt()
  sectionId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Academic Year ID — if provided with sectionId, the student will be auto-enrolled',
  })
  @IsOptional()
  @IsInt()
  academicYearId?: number;

  // ─── Guardian fields (required unless draft) ─────────
  @ApiProperty({ example: 'Jane Doe' })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  @IsString()
  guardianName: string;

  @ApiProperty({ example: '+1555000001' })
  @ValidateIf((o) => !o.isDraft)
  @IsNotEmpty()
  @IsString()
  guardianPhone: string;

  @ApiPropertyOptional({ example: 'guardian@example.com' })
  @IsOptional()
  @IsEmail()
  guardianEmail?: string | null;

  @ApiPropertyOptional({ example: 'Mother' })
  @IsOptional()
  @IsString()
  guardianRelation?: string | null;

  // ─── Optional profile fields ─────────────────────────
  @ApiPropertyOptional({ example: '456 Oak Street' })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional({ example: 'Springfield' })
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiPropertyOptional({ enum: BloodGroupEnum, example: 'O+' })
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

  @ApiPropertyOptional({ example: '2025-04-01' })
  @IsOptional()
  @IsDateString()
  admissionDate?: string | null;
}
