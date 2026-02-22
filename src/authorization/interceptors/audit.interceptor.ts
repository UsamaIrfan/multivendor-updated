import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../services/audit.service';
import { AuthorizationContext } from '../domain/authorization-context';

/** HTTP methods that represent mutating operations */
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Global interceptor that automatically logs mutating HTTP requests
 * to the audit_log table.
 *
 * - Only fires for POST, PUT, PATCH, DELETE requests
 * - Writes are fire-and-forget (async, errors are swallowed)
 * - Captures the route path, request body, and IP address
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method: string = request.method?.toUpperCase();

    // Only audit mutating requests
    if (!MUTATING_METHODS.has(method)) {
      return next.handle();
    }

    const authCtx: AuthorizationContext | undefined =
      request.authorizationContext;

    // Skip if no authorization context (unauthenticated routes)
    if (!authCtx?.tenantId) {
      return next.handle();
    }

    const routePath: string = request.route?.path ?? request.url;
    const controllerName = context.getClass().name;

    return next.handle().pipe(
      tap({
        next: () => {
          // Log on success
          this.auditService.log({
            tenantId: authCtx.tenantId!,
            userId: authCtx.userId,
            action: `${method} ${routePath}`,
            resourceType: controllerName,
            resourceId: request.params?.id?.toString() ?? null,
            details: this.sanitizeBody(request.body),
            ipAddress: this.extractIp(request),
          });
        },
        error: () => {
          // Don't log failed requests as audit events
        },
      }),
    );
  }

  /**
   * Strip sensitive fields from the request body before persisting.
   */
  private sanitizeBody(
    body: Record<string, any> | undefined,
  ): Record<string, any> | null {
    if (!body || typeof body !== 'object') {
      return null;
    }

    const SENSITIVE_KEYS = new Set([
      'password',
      'currentPassword',
      'newPassword',
      'confirmPassword',
      'token',
      'refreshToken',
      'secret',
      'apiKey',
    ]);

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      if (SENSITIVE_KEYS.has(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Extract client IP address from the request.
   */
  private extractIp(request: any): string | null {
    return (
      request.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ??
      request.ip ??
      request.connection?.remoteAddress ??
      null
    );
  }
}
