import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { AttendanceStatusEnum } from '../../common/enums/attendance-status.enum';

export class CreateStudentAttendanceDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  studentId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  sectionId: number;

  @ApiProperty({ example: '2025-06-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    enum: AttendanceStatusEnum,
    default: AttendanceStatusEnum.present,
  })
  @IsOptional()
  @IsEnum(AttendanceStatusEnum)
  status?: AttendanceStatusEnum;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}
