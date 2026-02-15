import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EmploymentTypeEnum } from '../../lms/common/enums/general.enum';
import { TenantAwareBaseDto } from '../../lms/common/dto/tenant-aware-base.dto';

export class CreateStaffMgmtDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1, description: 'User ID (OneToOne)' })
  @IsInt()
  userId: number;

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
