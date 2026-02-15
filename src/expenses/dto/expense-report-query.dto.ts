import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class ExpenseReportQueryDto {
  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Report start date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Report end date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by branch (omit for all branches)',
  })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({
    example: 'Utilities',
    description: 'Filter by expense category',
  })
  @IsOptional()
  @IsString()
  category?: string;
}
