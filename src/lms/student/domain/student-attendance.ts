import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { AttendanceStatusEnum } from '../../common/enums/attendance-status.enum';

export class StudentAttendance extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  studentId!: number;

  @ApiProperty({ type: Number })
  sectionId!: number;

  @ApiProperty({ type: Date })
  date!: Date;

  @ApiProperty({ enum: AttendanceStatusEnum })
  status!: AttendanceStatusEnum;

  @ApiPropertyOptional({ type: String })
  remarks!: string | null;
}
