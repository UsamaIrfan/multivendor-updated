import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { AuthorizationContext } from '../domain/authorization-context';
import { PermissionService } from '../services/permission.service';
import { ScopeResolverService } from '../services/scope-resolver.service';

/**
 * Guard that enforces permission-based access control.
 *
 * This guard is **self-contained**: it resolves the user's effective
 * permissions and scope context internally (using PermissionService and
 * ScopeResolverService), then attaches the resulting `AuthorizationContext`
 * to `request.authorizationContext`. It also checks that the user holds
 * at least one of the permissions listed in `@RequirePermissions(...)`.
 *
 * NestJS execution order: Guards → Interceptors → Handler.
 * Because guards run before interceptors, the guard must resolve
 * permissions itself rather than relying on an interceptor to do so.
 *
 * If no `@RequirePermissions()` metadata is set on the route, access is
 * granted (the guard does nothing). This supports backward compatibility:
 * controllers that only use `@Roles()` continue to work without change.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
    private readonly scopeResolverService: ScopeResolverService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Merge handler-level and class-level metadata (handler wins)
    const requiredPermissions = this.reflector.getAllAndOverride<
      string[] | undefined
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // No @RequirePermissions decorator → allow (backward compat)
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no authenticated user, deny
    if (!user?.id || !user?.role?.id) {
      this.logger.warn(
        'PermissionsGuard: no authenticated user on request — denying access',
      );
      throw new ForbiddenException('Insufficient permissions');
    }

    // Resolve authorizationContext if not already present
    let authCtx: AuthorizationContext | undefined =
      request.authorizationContext;

    if (!authCtx) {
      try {
        const userId: number = user.id;
        const roleId: number = user.role.id;
        const tenantId: string | null = user.tenantId ?? null;
        const branchId: string | null =
          request.headers?.['x-branch-id'] ?? null;

        const [permissions, scopeContext] = await Promise.all([
          this.permissionService.resolveEffectivePermissions(
            roleId,
            userId,
            tenantId,
          ),
          this.scopeResolverService.resolve(
            userId,
            roleId,
            tenantId,
            branchId,
          ),
        ]);

        authCtx = {
          userId,
          roleId,
          tenantId,
          branchId,
          permissions,
          scopeContext,
        };

        // Attach to request so downstream interceptors/handlers can use it
        request.authorizationContext = authCtx;
      } catch (err) {
        this.logger.error(
          `Failed to resolve authorization context for user ${user.id}: ${err}`,
        );
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    // OR logic: user must have at least one of the required permissions
    const hasPermission = requiredPermissions.some((code) =>
      authCtx!.permissions.has(code),
    );

    if (!hasPermission) {
      this.logger.debug(
        `User ${authCtx.userId} denied: needs [${requiredPermissions.join(', ')}], ` +
          `has [${[...authCtx.permissions.keys()].join(', ')}]`,
      );
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
