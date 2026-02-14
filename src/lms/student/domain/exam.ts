import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { ExamTypeEnum } from '../../common/enums/exam.enum';
import { ExamStatusEnum } from '../../common/enums/exam-status.enum';

export class Exam extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  termId!: number;

  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty({ enum: ExamTypeEnum })
  type!: ExamTypeEnum;

  @ApiProperty({ enum: ExamStatusEnum })
  status!: ExamStatusEnum;

  @ApiProperty({ type: Date })
  startDate!: Date;

  @ApiProperty({ type: Date })
  endDate!: Date;

  @ApiPropertyOptional({ type: String })
  description!: string | null;
}
