import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { LeaveStatusEnum } from '../../common/enums/leave-status.enum';

export class LeaveRequest extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  studentId!: number;

  @ApiProperty({ type: Date })
  fromDate!: Date;

  @ApiProperty({ type: Date })
  toDate!: Date;

  @ApiProperty({ type: String })
  reason!: string;

  @ApiProperty({ enum: LeaveStatusEnum })
  status!: LeaveStatusEnum;

  @ApiPropertyOptional({ type: Number })
  approvedById!: number | null;

  @ApiPropertyOptional({ type: String })
  adminRemarks!: string | null;
}
