import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class QueryStudentDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({ example: 'John', description: 'Search by name' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Filter by enrollment status',
  })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by institution' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  institutionId?: number;
}
