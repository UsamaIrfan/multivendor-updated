import { Global, Module } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';
import { RequireTenantGuard } from '../guards/require-tenant.guard';

/**
 * Global module so TenantContextService and RequireTenantGuard
 * are available everywhere without explicit imports.
 */
@Global()
@Module({
  providers: [TenantContextService, RequireTenantGuard],
  exports: [TenantContextService, RequireTenantGuard],
})
export class TenantContextModule {}
