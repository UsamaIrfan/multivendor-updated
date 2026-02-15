import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';

export class Timetable extends LmsBaseDomain {
  @ApiProperty({ type: String, format: 'uuid' })
  declare id: any;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Branch this timetable belongs to',
  })
  declare branchId: string;

  @ApiProperty({ type: String, format: 'uuid' })
  classId: string;

  @ApiProperty({ type: String, format: 'uuid' })
  academicYearId: string;

  @ApiPropertyOptional({ example: 'Class 10-A Timetable' })
  name: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;
}
