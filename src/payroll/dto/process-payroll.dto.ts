import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { TenantAwareBaseDto } from '../../lms/common/dto/tenant-aware-base.dto';

export class ProcessPayrollDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1, description: 'Month (1-12)' })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  year: number;

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description: 'Filter by branch. Omit to process all branches.',
  })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
