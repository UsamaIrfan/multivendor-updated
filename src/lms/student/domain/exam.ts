import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { ExamTypeEnum } from '../../common/enums/exam.enum';

export class Exam extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  termId!: number;

  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty({ enum: ExamTypeEnum })
  type!: ExamTypeEnum;

  @ApiProperty({ type: Date })
  startDate!: Date;

  @ApiProperty({ type: Date })
  endDate!: Date;

  @ApiPropertyOptional({ type: String })
  description!: string | null;
}
