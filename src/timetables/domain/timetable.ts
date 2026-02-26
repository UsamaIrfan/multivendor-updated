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

  @ApiProperty({ type: Number })
  classId: number;

  @ApiPropertyOptional({ example: 'Grade 10' })
  className?: string;

  @ApiPropertyOptional({ type: Number })
  sectionId?: number | null;

  @ApiPropertyOptional({ example: 'A' })
  sectionName?: string | null;

  @ApiProperty({ type: Number })
  academicYearId: number;

  @ApiPropertyOptional({ example: '2025-2026' })
  academicYearName?: string;

  @ApiPropertyOptional({ example: 'Class 10-A Timetable' })
  name: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;
}
