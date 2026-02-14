import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { ExamStatusEnum } from '../../lms/common/enums/exam-status.enum';

export class UpdateExamStatusDto {
  @ApiProperty({ enum: ExamStatusEnum })
  @IsString()
  @IsEnum(ExamStatusEnum)
  status!: ExamStatusEnum;
}
