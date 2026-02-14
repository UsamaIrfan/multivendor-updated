import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ExamTypeEnum } from '../../common/enums/exam.enum';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateExamDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  termId: number;

  @ApiProperty({ example: 'Mid-Term Examination' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: ExamTypeEnum, default: ExamTypeEnum.midterm })
  @IsOptional()
  @IsEnum(ExamTypeEnum)
  type?: ExamTypeEnum;

  @ApiProperty({ example: '2025-07-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-07-10' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 'Mid-term examination for all subjects' })
  @IsOptional()
  @IsString()
  description?: string | null;
}
