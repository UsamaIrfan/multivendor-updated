import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatusEnum } from '../../lms/common/enums/attendance-status.enum';

export class BulkAttendanceRecordDto {
  @ApiProperty({ enum: ['student', 'staff'] })
  @IsNotEmpty()
  @IsString()
  attendableType: 'student' | 'staff';

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  attendableId: number;

  @ApiProperty({ enum: AttendanceStatusEnum })
  @IsNotEmpty()
  @IsEnum(AttendanceStatusEnum)
  status: AttendanceStatusEnum;

  @IsOptional()
  @IsString()
  checkIn?: string;

  @IsOptional()
  @IsString()
  checkOut?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class BulkAttendanceDto {
  @ApiProperty({ example: '2025-12-01' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  sectionId?: number;

  @ApiProperty({ type: [BulkAttendanceRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkAttendanceRecordDto)
  records: BulkAttendanceRecordDto[];
}
