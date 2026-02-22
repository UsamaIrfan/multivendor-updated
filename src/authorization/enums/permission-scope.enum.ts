/**
 * Scope levels for permission enforcement.
 * Determines the data boundary for a permission.
 */
export enum PermissionScopeEnum {
  /** Cross-tenant access — platform operators only */
  PLATFORM = 'platform',
  /** All data within the tenant */
  TENANT = 'tenant',
  /** Data within a specific branch */
  BRANCH = 'branch',
  /** Data within assigned sections (for teachers) */
  SECTION = 'section',
  /** Only the user's own records */
  SELF = 'self',
  /** Only linked children's records (for parents) */
  PARENT = 'parent',
}
