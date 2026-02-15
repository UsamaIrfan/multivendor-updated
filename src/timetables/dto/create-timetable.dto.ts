import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
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

  @ApiProperty({ type: String, format: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  classId: string;

  @ApiProperty({ type: String, format: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  academicYearId: string;

  @ApiPropertyOptional({ example: 'Class 10-A Timetable' })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
