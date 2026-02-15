import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';
import {
  LeaveStatusEnum,
  LeaveTypeEnum,
} from '../../lms/common/enums/leave-status.enum';

export class StaffLeaveApplication extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  staffId!: number;

  @ApiProperty({ example: '2026-03-01' })
  fromDate!: Date;

  @ApiProperty({ example: '2026-03-03' })
  toDate!: Date;

  @ApiProperty({ enum: LeaveTypeEnum })
  leaveType!: LeaveTypeEnum;

  @ApiProperty({ example: 'Family event' })
  reason!: string;

  @ApiProperty({ enum: LeaveStatusEnum })
  status!: LeaveStatusEnum;

  @ApiPropertyOptional({ example: 1, nullable: true })
  approvedById!: number | null;

  @ApiPropertyOptional({ example: 'Approved by admin', nullable: true })
  adminRemarks!: string | null;
}
