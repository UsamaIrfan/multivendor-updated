import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryStudentEnrollmentDto {
  @ApiPropertyOptional({ description: 'Filter by section ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sectionId?: number;

  @ApiPropertyOptional({
    description: 'Filter by enrollment status (e.g. active)',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
