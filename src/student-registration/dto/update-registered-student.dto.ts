import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  GenderEnum,
  BloodGroupEnum,
} from '../../lms/common/enums/general.enum';

export class UpdateRegisteredStudentDto {
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
}
