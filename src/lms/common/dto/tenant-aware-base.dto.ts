import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Base DTO for all tenant-aware create operations.
 * tenantId is optional because the server auto-populates it from
 * TenantContextService (JWT / X-Tenant-ID header) in every repository.
 */
export class TenantAwareBaseDto {
  @ApiPropertyOptional({ type: String, format: 'uuid' })
  @IsOptional()
  @IsString()
  @Matches(UUID_REGEX, { message: 'tenantId must be a UUID' })
  tenantId?: string;

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  @IsOptional()
  @IsString()
  @Matches(UUID_REGEX, { message: 'branchId must be a UUID' })
  branchId?: string | null;
}
