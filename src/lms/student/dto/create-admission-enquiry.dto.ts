import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AdmissionStatusEnum } from '../../common/enums/admission-status.enum';
import { EnquirySourceEnum } from '../../common/enums/general.enum';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateAdmissionEnquiryDto extends TenantAwareBaseDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  institutionId?: number | null;

  @ApiProperty({ example: 'Jane Smith' })
  @IsNotEmpty()
  @IsString()
  studentName: string;

  @ApiPropertyOptional({ example: 'Robert Smith' })
  @IsOptional()
  @IsString()
  guardianName?: string | null;

  @ApiPropertyOptional({ example: '+1-555-0102' })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiPropertyOptional({ example: 'parent@example.com' })
  @IsOptional()
  @IsString()
  email?: string | null;

  @ApiPropertyOptional({ example: 'Old Town School' })
  @IsOptional()
  @IsString()
  previousSchool?: string | null;

  @ApiPropertyOptional({ example: 'Grade 5' })
  @IsOptional()
  @IsString()
  gradeApplyingFor?: string | null;

  @ApiPropertyOptional({
    enum: AdmissionStatusEnum,
    default: AdmissionStatusEnum['new'],
  })
  @IsOptional()
  @IsEnum(AdmissionStatusEnum)
  status?: AdmissionStatusEnum;

  @ApiPropertyOptional({
    enum: EnquirySourceEnum,
    default: EnquirySourceEnum.walk_in,
  })
  @IsOptional()
  @IsEnum(EnquirySourceEnum)
  source?: EnquirySourceEnum;

  @ApiPropertyOptional({ example: 'Interested in science program' })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({ example: '2025-06-01' })
  @IsOptional()
  @IsDateString()
  followUpDate?: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  convertedStudentId?: number | null;
}
