import { PermissionScopeEnum } from '../enums';

/**
 * Represents a resolved permission with its associated scope.
 * Used internally by the authorization system.
 */
export interface EffectivePermission {
  /** Permission code string, e.g. 'academic.student.read' */
  code: string;
  /** The scope level for this permission */
  scope: PermissionScopeEnum;
}

/**
 * Context object attached to each request after scope resolution.
 * Used by guards, services, and repository filters.
 */
export interface AuthorizationContext {
  userId: number;
  roleId: number;
  tenantId: string | null;
  branchId: string | null;
  /** Map of permission code → scope */
  permissions: Map<string, PermissionScopeEnum>;
  /** Scope-specific context resolved from DB relationships */
  scopeContext: ScopeContext;
}

/**
 * Dynamic scope context resolved from existing database relationships.
 */
export interface ScopeContext {
  /** For teachers: section IDs they teach (from timetable_slot) */
  allowedSectionIds: number[];
  /** For parents: student IDs of linked children (from student_guardian) */
  allowedStudentIds: number[];
  /** Staff record ID for the current user (for self-scope HR operations) */
  staffId: number | null;
  /** Student record ID for the current user (for self-scope student operations) */
  studentId: number | null;
}
