import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';
import { LeaveTypeEnum } from '../../lms/common/enums/leave-status.enum';

export class ApplyLeaveDto {
  @ApiProperty({ enum: ['student', 'staff'] })
  @IsNotEmpty()
  @IsString()
  attendableType: 'student' | 'staff';

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  attendableId: number;

  @ApiProperty({ example: '2025-12-10' })
  @IsNotEmpty()
  @IsDateString()
  fromDate: string;

  @ApiProperty({ example: '2025-12-12' })
  @IsNotEmpty()
  @IsDateString()
  toDate: string;

  @ApiProperty({ example: 'Family event' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({ enum: LeaveTypeEnum })
  @IsNotEmpty()
  @IsEnum(LeaveTypeEnum)
  leaveType: LeaveTypeEnum;

  @ApiPropertyOptional({ example: 'attachment-file-id' })
  @IsOptional()
  @IsString()
  documentId?: string;
}
