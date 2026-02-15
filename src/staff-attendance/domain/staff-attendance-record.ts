import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';
import { AttendanceStatusEnum } from '../../lms/common/enums/attendance-status.enum';

export class StaffAttendanceRecord extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  staffId!: number;

  @ApiProperty({ example: '2026-02-15' })
  date!: string;

  @ApiProperty({ enum: AttendanceStatusEnum })
  status!: AttendanceStatusEnum;

  @ApiProperty({ example: '2026-02-15T08:00:00.000Z' })
  checkInTime!: Date;

  @ApiPropertyOptional({ example: '2026-02-15T17:00:00.000Z', nullable: true })
  checkOutTime!: Date | null;

  @ApiPropertyOptional({ example: 'On time', nullable: true })
  remarks!: string | null;
}
