import { Global, Module } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';

/**
 * Global module so TenantContextService is available everywhere
 * without explicit imports.
 */
@Global()
@Module({
  providers: [TenantContextService],
  exports: [TenantContextService],
})
export class TenantContextModule {}
