import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

/**
 * Base DTO for all tenant-aware create operations.
 * Every LMS create DTO should extend this to ensure tenantId is provided.
 */
export class TenantAwareBaseDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  tenantId!: string;

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  branchId?: string | null;
}
