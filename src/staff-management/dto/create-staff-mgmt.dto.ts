import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { EmploymentTypeEnum } from '../../lms/common/enums/general.enum';
import { TenantAwareBaseDto } from '../../lms/common/dto/tenant-aware-base.dto';

export class CreateStaffMgmtDto extends TenantAwareBaseDto {
  @ApiPropertyOptional({
    example: 1,
    description:
      'User ID (OneToOne). Provide either userId OR (email + password + firstName + lastName) to auto-create a user account.',
  })
  @IsOptional()
  @IsInt()
  userId?: number;

  // ─── Auto-create user fields (used when userId is not provided) ────
  @ApiPropertyOptional({
    example: 'staff@example.com',
    description: 'Email for auto-creating a user account (required if userId is not provided)',
  })
  @ValidateIf((o) => !o.userId)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'password123',
    description: 'Password for the new user account (required if userId is not provided)',
  })
  @ValidateIf((o) => !o.userId)
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    example: 'John',
    description: 'First name for the new user account (required if userId is not provided)',
  })
  @ValidateIf((o) => !o.userId)
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'Last name for the new user account (required if userId is not provided)',
  })
  @ValidateIf((o) => !o.userId)
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    example: 'teacher',
    enum: ['teacher', 'staff', 'accountant'],
    default: 'staff',
    description: 'Role for the auto-created user (teacher=4, staff=5, accountant=6)',
  })
  @IsOptional()
  @IsEnum(['teacher', 'staff', 'accountant'])
  userRole?: 'teacher' | 'staff' | 'accountant';

  @ApiProperty({ example: 1 })
  @IsInt()
  institutionId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  departmentId?: number | null;

  @ApiPropertyOptional({ example: 'Senior Teacher' })
  @IsOptional()
  @IsString()
  designation?: string | null;

  @ApiPropertyOptional({ example: 'M.Ed' })
  @IsOptional()
  @IsString()
  qualification?: string | null;

  @ApiPropertyOptional({ example: 'Mathematics' })
  @IsOptional()
  @IsString()
  specialization?: string | null;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  experienceYears?: number | null;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  joiningDate?: string | null;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  basicSalary?: number;

  @ApiPropertyOptional({
    enum: EmploymentTypeEnum,
    default: EmploymentTypeEnum.full_time,
  })
  @IsOptional()
  @IsEnum(EmploymentTypeEnum)
  employmentType?: EmploymentTypeEnum;

  @ApiPropertyOptional({ example: '+923001234567' })
  @IsOptional()
  @IsString()
  emergencyContact?: string | null;

  @ApiPropertyOptional({ example: '123 Main St' })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional({
    example: ['teacher', 'coordinator'],
    description: 'Branch-specific roles for initial branch assignment',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];
}
