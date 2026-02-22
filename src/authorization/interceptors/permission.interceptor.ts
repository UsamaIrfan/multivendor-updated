import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PermissionService } from '../services/permission.service';
import { ScopeResolverService } from '../services/scope-resolver.service';
import { AuthorizationContext } from '../domain/authorization-context';

/**
 * Global interceptor that resolves the current user's effective permissions
 * and scope context, then attaches an `AuthorizationContext` to the request.
 *
 * NestJS execution order: Guards → Interceptors → Handler.
 *
 * If PermissionsGuard already resolved and attached `authorizationContext`
 * (for routes using `@RequirePermissions()`), this interceptor skips
 * resolution to avoid double work. For routes without PermissionsGuard
 * (e.g. `AuthorizationMeController`), the interceptor still resolves
 * context so handlers can read `request.authorizationContext`.
 *
 * Registration order is handled by registering this as APP_INTERCEPTOR
 * in the AuthorizationModule.
 */
@Injectable()
export class PermissionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PermissionInterceptor.name);

  constructor(
    private readonly permissionService: PermissionService,
    private readonly scopeResolverService: ScopeResolverService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // Skip if PermissionsGuard already resolved the context
    if (request.authorizationContext) {
      return next.handle();
    }

    const user = request.user;

    // Skip if no authenticated user (public routes)
    if (!user?.id) {
      return next.handle();
    }

    const userId: number = user.id;
    const roleId: number = user.role?.id;
    const tenantId: string | null = user.tenantId ?? null;

    // Skip permission resolution if no role
    if (!roleId) {
      return next.handle();
    }

    try {
      // Resolve effective permissions and scope context in parallel
      const branchId: string | null = request.headers?.['x-branch-id'] ?? null;

      const [permissions, scopeContext] = await Promise.all([
        this.permissionService.resolveEffectivePermissions(
          roleId,
          userId,
          tenantId,
        ),
        this.scopeResolverService.resolve(userId, roleId, tenantId, branchId),
      ]);

      const authCtx: AuthorizationContext = {
        userId,
        roleId,
        tenantId,
        branchId,
        permissions,
        scopeContext,
      };

      // Attach to request for downstream handlers and interceptors
      request.authorizationContext = authCtx;
    } catch (err) {
      this.logger.error(
        `Failed to resolve authorization context for user ${userId}: ${err}`,
      );
      // Don't block the request — handler / other logic may not need it
    }

    return next.handle();
  }
}
