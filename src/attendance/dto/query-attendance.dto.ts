import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { AttendanceStatusEnum } from '../../lms/common/enums/attendance-status.enum';

export class QueryAttendanceDto {
  @ApiPropertyOptional({ example: '2025-12-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: ['student', 'staff'] })
  @IsOptional()
  @IsString()
  attendableType?: 'student' | 'staff';

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  attendableId?: number;

  @ApiPropertyOptional({ enum: AttendanceStatusEnum })
  @IsOptional()
  @IsEnum(AttendanceStatusEnum)
  status?: AttendanceStatusEnum;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  sectionId?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @IsInt()
  limit?: number;
}
