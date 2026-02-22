import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_TENANT_CHECK_KEY } from '../decorators/skip-tenant-check.decorator';
import { TenantContextService } from '../tenant-context/tenant-context.service';

/**
 * Guard that ensures a tenant context is present for the current request.
 *
 * Apply at the controller class level alongside AuthGuard and RolesGuard.
 * All tenant-scoped controllers (fees, attendance, exams, etc.) should use
 * this guard so that admins without a selected tenant get a clear 403
 * instead of a database constraint violation.
 *
 * Individual routes can opt out via `@SkipTenantCheck()` decorator
 * (e.g. for routes that don't touch tenant-scoped data).
 *
 * **Execution order**: Guards run before interceptors, but NestJS evaluates
 * guards in the order they appear in `@UseGuards(...)`. Place this guard
 * AFTER `AuthGuard('jwt')` and `RolesGuard` so the user is authenticated
 * and role-checked first. The `TenantInterceptor` (which populates
 * `TenantContextService` via `AsyncLocalStorage`) runs AFTER all guards,
 * so this guard inspects the raw request instead of the context service.
 */
@Injectable()
export class RequireTenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantContext: TenantContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Allow individual routes to opt out
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_TENANT_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skip) {
      return true;
    }

    // Guards run before interceptors, so TenantContextService is not yet
    // populated. Check the raw request for tenant resolution sources.
    const request = context.switchToHttp().getRequest();

    const hasTenantFromJwt = !!request.user?.tenantId;
    const hasTenantFromHeader = !!request.headers?.['x-tenant-id'];

    if (hasTenantFromJwt || hasTenantFromHeader) {
      return true;
    }

    throw new ForbiddenException(
      'A tenant must be selected to perform this action. Please select a tenant first.',
    );
  }
}
