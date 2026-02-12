import { ApiProperty } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { AttendanceStatusEnum } from '../../common/enums/attendance-status.enum';

export class StaffAttendance extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  staffId!: number;

  @ApiProperty({ example: '2024-01-15' })
  date!: Date;

  @ApiProperty({ enum: AttendanceStatusEnum })
  status!: AttendanceStatusEnum;

  @ApiProperty({ example: '08:00', nullable: true })
  checkIn!: string | null;

  @ApiProperty({ example: '16:00', nullable: true })
  checkOut!: string | null;

  @ApiProperty({ example: 'Arrived late due to traffic', nullable: true })
  remarks!: string | null;
}
