import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { TenantRepository } from '../infrastructure/persistence/tenant.repository';
import { TenantUserRepository } from '../infrastructure/persistence/tenant-user.repository';

/**
 * Intercepts every request and sets the tenant context using AsyncLocalStorage.
 *
 * Tenant resolution order:
 * 1. JWT token claim `tenantId` (set after tenant selection at login)
 * 2. `X-Tenant-ID` header (API key / machine-to-machine)
 * 3. Subdomain extraction (e.g., `abc.example.com` → slug `abc`)
 *
 * Branch resolution:
 * 1. `X-Branch-ID` header (optional)
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly tenantRepository: TenantRepository,
    private readonly tenantUserRepository: TenantUserRepository,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const tenantId = await this.resolveTenantId(request);
    const branchId = this.resolveBranchId(request);

    // Validate tenant exists and is active
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new BadRequestException('Invalid tenant');
    }
    if (!tenant.isActive) {
      throw new ForbiddenException('Tenant is inactive');
    }

    // If user is authenticated, verify they belong to this tenant
    if (request.user?.id) {
      const tenantUser = await this.tenantUserRepository.findByTenantAndUser(
        tenantId,
        request.user.id,
      );
      if (!tenantUser || !tenantUser.isActive) {
        throw new ForbiddenException(
          'User does not have access to this tenant',
        );
      }
    }

    // Set tenant context for this request
    return new Observable((subscriber) => {
      this.tenantContext.run({ tenantId, branchId }, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }

  private async resolveTenantId(request: any): Promise<string> {
    // 1) JWT claim
    if (request.user?.tenantId) {
      return request.user.tenantId;
    }

    // 2) Header
    const headerTenantId = request.headers['x-tenant-id'];
    if (headerTenantId) {
      return headerTenantId;
    }

    // 3) Subdomain
    const host = request.headers['host'] || '';
    const subdomain = this.extractSubdomain(host);
    if (subdomain) {
      const tenant = await this.tenantRepository.findBySlug(subdomain);
      if (tenant) {
        return tenant.id;
      }
    }

    throw new BadRequestException(
      'Tenant ID is required. Provide via JWT, X-Tenant-ID header, or subdomain.',
    );
  }

  private resolveBranchId(request: any): string | null {
    return request.headers['x-branch-id'] || null;
  }

  private extractSubdomain(host: string): string | null {
    // Remove port number
    const hostname = host.split(':')[0];
    const parts = hostname.split('.');

    // Need at least 3 parts (subdomain.domain.tld)
    if (parts.length >= 3) {
      // Skip common non-tenant subdomains
      const sub = parts[0];
      if (['www', 'api', 'app', 'admin'].includes(sub)) {
        return null;
      }
      return sub;
    }
    return null;
  }
}
