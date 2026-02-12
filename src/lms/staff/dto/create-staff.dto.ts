import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EmploymentTypeEnum } from '../../common/enums/general.enum';

export class CreateStaffDto {
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

  @ApiProperty({ example: 'EMP-001' })
  @IsNotEmpty()
  @IsString()
  employeeId: string;

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
}
