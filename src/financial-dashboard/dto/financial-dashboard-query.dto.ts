import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class FinancialDashboardQueryDto {
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
    description: 'Filter P&L by specific branch',
  })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
