import { ApiProperty } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';
import { LeaveTypeEnum } from '../../lms/common/enums/leave-status.enum';

export class StaffLeaveBalance extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  staffId!: number;

  @ApiProperty({ enum: LeaveTypeEnum })
  leaveType!: LeaveTypeEnum;

  @ApiProperty({ example: 15.0, description: 'Total allocated leave days' })
  totalDays!: number;

  @ApiProperty({ example: 3.0, description: 'Used leave days' })
  usedDays!: number;

  @ApiProperty({ example: 2026, description: 'Calendar year' })
  year!: number;
}
