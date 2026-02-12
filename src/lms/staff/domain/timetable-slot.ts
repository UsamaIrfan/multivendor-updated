import { ApiProperty } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { DayOfWeekEnum } from '../../common/enums/general.enum';

export class TimetableSlot extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  sectionId!: number;

  @ApiProperty({ example: 1 })
  subjectId!: number;

  @ApiProperty({ example: 1, nullable: true })
  staffId!: number | null;

  @ApiProperty({ enum: DayOfWeekEnum })
  dayOfWeek!: DayOfWeekEnum;

  @ApiProperty({ example: '08:00' })
  startTime!: string;

  @ApiProperty({ example: '09:00' })
  endTime!: string;

  @ApiProperty({ example: 'Room 101', nullable: true })
  room!: string | null;
}
