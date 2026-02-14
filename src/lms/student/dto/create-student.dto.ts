import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { GenderEnum, BloodGroupEnum } from '../../common/enums/general.enum';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateStudentDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  institutionId: number;

  @ApiProperty({ example: 'STU-2025-001' })
  @IsNotEmpty()
  @IsString()
  rollNumber: string;

  @ApiPropertyOptional({ example: '2010-05-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string | null;

  @ApiPropertyOptional({ enum: GenderEnum, example: GenderEnum.male })
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum | null;

  @ApiPropertyOptional({ example: 'John Doe Sr.' })
  @IsOptional()
  @IsString()
  guardianName?: string | null;

  @ApiPropertyOptional({ example: '+1-555-0101' })
  @IsOptional()
  @IsString()
  guardianPhone?: string | null;

  @ApiPropertyOptional({ example: 'guardian@example.com' })
  @IsOptional()
  @IsString()
  guardianEmail?: string | null;

  @ApiPropertyOptional({ example: 'Father' })
  @IsOptional()
  @IsString()
  guardianRelation?: string | null;

  @ApiPropertyOptional({ example: '456 Oak Street' })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional({ example: 'Springfield' })
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiPropertyOptional({ enum: BloodGroupEnum, example: BloodGroupEnum['O+'] })
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
