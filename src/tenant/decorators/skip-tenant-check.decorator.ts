import { SetMetadata } from '@nestjs/common';

export const SKIP_TENANT_CHECK_KEY = 'skipTenantCheck';

/**
 * Decorator to skip the RequireTenantGuard check on a specific route handler.
 * Use on routes that don't touch tenant-scoped data even though the
 * controller as a whole requires a tenant.
 */
export const SkipTenantCheck = () => SetMetadata(SKIP_TENANT_CHECK_KEY, true);
