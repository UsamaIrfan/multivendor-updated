import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Base DTO for all tenant-aware create operations.
 * Every LMS create DTO should extend this to ensure tenantId is provided.
 */
export class TenantAwareBaseDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsNotEmpty()
  @IsString()
  @Matches(UUID_REGEX, { message: 'tenantId must be a UUID' })
  tenantId!: string;

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  @IsOptional()
  @IsString()
  @Matches(UUID_REGEX, { message: 'branchId must be a UUID' })
  branchId?: string | null;
}
