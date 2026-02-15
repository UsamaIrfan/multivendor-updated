import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { TenantAwareBaseDto } from '../../lms/common/dto/tenant-aware-base.dto';
import { LeaveTypeEnum } from '../../lms/common/enums/leave-status.enum';

export class ApplyStaffLeaveDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1, description: 'Staff ID (from staff_mgmt)' })
  @IsNotEmpty()
  @IsInt()
  staffId: number;

  @ApiProperty({ example: '2026-03-01' })
  @IsNotEmpty()
  @IsDateString()
  fromDate: string;

  @ApiProperty({ example: '2026-03-03' })
  @IsNotEmpty()
  @IsDateString()
  toDate: string;

  @ApiProperty({ enum: LeaveTypeEnum, example: LeaveTypeEnum.casual })
  @IsNotEmpty()
  @IsEnum(LeaveTypeEnum)
  leaveType: LeaveTypeEnum;

  @ApiProperty({ example: 'Family event' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}
