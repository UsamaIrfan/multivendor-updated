import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId: string;
  branchId?: string | null;
}

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  /**
   * Run a callback within a tenant context.
   * All code inside the callback (including async) will share this context.
   */
  run<T>(context: TenantContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  /**
   * Get the current tenant context.
   * Returns undefined if called outside a tenant-scoped request.
   */
  getContext(): TenantContext | undefined {
    return this.storage.getStore();
  }

  /**
   * Get the current tenant ID. Throws if not in a tenant context.
   */
  getTenantId(): string {
    const ctx = this.getContext();
    if (!ctx) {
      throw new Error(
        'Tenant context is not available. Ensure TenantInterceptor is applied.',
      );
    }
    return ctx.tenantId;
  }

  /**
   * Get the current branch ID (may be null).
   */
  getBranchId(): string | null | undefined {
    const ctx = this.getContext();
    return ctx?.branchId;
  }

  /**
   * Check if currently running within a tenant context.
   */
  hasContext(): boolean {
    return this.storage.getStore() !== undefined;
  }
}
