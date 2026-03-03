import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GradeSubmissionDto {
  @ApiProperty({ type: Number, description: 'Marks awarded' })
  @IsInt()
  @Min(0)
  marks!: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Letter grade (e.g. A, B+, C)',
  })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Teacher feedback on the submission',
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}
