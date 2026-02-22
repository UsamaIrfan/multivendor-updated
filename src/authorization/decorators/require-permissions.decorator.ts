import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used by PermissionsGuard to retrieve required permissions.
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator that declares the permission codes required for a route.
 *
 * When multiple codes are passed the user needs **at least one** of them
 * (OR logic). For AND logic, apply the decorator multiple times or use
 * a composite permission.
 *
 * @example
 * ```
 * @RequirePermissions('academic.student.read')
 * findAll() { ... }
 *
 * // OR logic — any of these suffices
 * @RequirePermissions('academic.student.create', 'academic.student.update')
 * upsert() { ... }
 * ```
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
