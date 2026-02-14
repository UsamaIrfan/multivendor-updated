import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AttendanceStatusEnum } from '../../lms/common/enums/attendance-status.enum';

export class MarkAttendanceDto {
  @ApiProperty({ enum: ['student', 'staff'] })
  @IsNotEmpty()
  @IsString()
  attendableType: 'student' | 'staff';

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  attendableId: number;

  @ApiProperty({ example: '2025-12-01' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ enum: AttendanceStatusEnum })
  @IsNotEmpty()
  @IsEnum(AttendanceStatusEnum)
  status: AttendanceStatusEnum;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString()
  checkIn?: string;

  @ApiPropertyOptional({ example: '16:00' })
  @IsOptional()
  @IsString()
  checkOut?: string;

  @ApiPropertyOptional({ example: 'Arrived late' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ example: 1, description: 'Section ID (for students)' })
  @IsOptional()
  @IsInt()
  sectionId?: number;
}
