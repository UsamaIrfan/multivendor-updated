import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber, IsOptional } from 'class-validator';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateExamSubjectDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  examId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  subjectId: number;

  @ApiPropertyOptional({ example: '2025-07-02' })
  @IsOptional()
  @IsDateString()
  examDate?: string | null;

  @ApiProperty({ example: 100 })
  @IsNumber()
  totalMarks: number;

  @ApiProperty({ example: 33 })
  @IsNumber()
  passingMarks: number;
}
