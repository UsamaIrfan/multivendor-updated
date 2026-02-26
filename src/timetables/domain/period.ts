import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';

export class Period extends LmsBaseDomain {
  @ApiProperty({ type: String, format: 'uuid' })
  declare id: any;

  @ApiProperty({ type: String, format: 'uuid' })
  declare branchId: string;

  @ApiProperty({ type: String, format: 'uuid' })
  timetableId: string;

  @ApiProperty({ type: Number })
  subjectId: number;

  @ApiProperty({ type: Number })
  teacherId: number;

  @ApiProperty({
    example: 1,
    description: '0=Sunday, 1=Monday, ..., 6=Saturday',
  })
  dayOfWeek: number;

  @ApiProperty({ example: '08:00', description: 'Start time in HH:mm' })
  startTime: string;

  @ApiProperty({ example: '08:45', description: 'End time in HH:mm' })
  endTime: string;

  @ApiPropertyOptional({ example: 'Room 101' })
  room: string | null;
}
