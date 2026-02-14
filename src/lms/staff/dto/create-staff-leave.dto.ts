import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  LeaveTypeEnum,
  LeaveStatusEnum,
} from '../../common/enums/leave-status.enum';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateStaffLeaveDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  staffId: number;

  @ApiProperty({ example: '2025-07-01' })
  @IsDateString()
  fromDate: string;

  @ApiProperty({ example: '2025-07-03' })
  @IsDateString()
  toDate: string;

  @ApiPropertyOptional({ enum: LeaveTypeEnum, default: LeaveTypeEnum.casual })
  @IsOptional()
  @IsEnum(LeaveTypeEnum)
  leaveType?: LeaveTypeEnum;

  @ApiProperty({ example: 'Family event' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    enum: LeaveStatusEnum,
    default: LeaveStatusEnum.pending,
  })
  @IsOptional()
  @IsEnum(LeaveStatusEnum)
  status?: LeaveStatusEnum;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  approvedById?: number | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  adminRemarks?: string | null;
}
