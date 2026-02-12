import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';

export class ExamSubject extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  examId!: number;

  @ApiProperty({ type: Number })
  subjectId!: number;

  @ApiPropertyOptional({ type: Date })
  examDate!: Date | null;

  @ApiProperty({ type: Number })
  totalMarks!: number;

  @ApiProperty({ type: Number })
  passingMarks!: number;
}
