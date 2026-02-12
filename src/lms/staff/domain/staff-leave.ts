import { ApiProperty } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import {
  LeaveTypeEnum,
  LeaveStatusEnum,
} from '../../common/enums/leave-status.enum';

export class StaffLeave extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  staffId!: number;

  @ApiProperty({ example: '2024-01-15' })
  fromDate!: Date;

  @ApiProperty({ example: '2024-01-17' })
  toDate!: Date;

  @ApiProperty({ enum: LeaveTypeEnum })
  leaveType!: LeaveTypeEnum;

  @ApiProperty({ example: 'Family event' })
  reason!: string;

  @ApiProperty({ enum: LeaveStatusEnum })
  status!: LeaveStatusEnum;

  @ApiProperty({ example: 1, nullable: true })
  approvedById!: number | null;

  @ApiProperty({ example: 'Approved for 3 days', nullable: true })
  adminRemarks!: string | null;
}
