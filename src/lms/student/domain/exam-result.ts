import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';

export class ExamResult extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  examSubjectId!: number;

  @ApiProperty({ type: Number })
  studentId!: number;

  @ApiPropertyOptional({ type: Number })
  marksObtained!: number | null;

  @ApiPropertyOptional({ type: String })
  grade!: string | null;

  @ApiProperty({ type: Boolean })
  isAbsent!: boolean;

  @ApiPropertyOptional({ type: String })
  remarks!: string | null;
}
