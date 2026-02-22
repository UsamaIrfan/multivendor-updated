import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ScopeContext } from '../domain/authorization-context';

/**
 * Cache entry for scope resolution.
 */
interface ScopeCacheEntry {
  scopeContext: ScopeContext;
  expiresAt: number;
}

const SCOPE_CACHE_TTL_MS = 120_000; // 2 minutes

/**
 * Resolves scope-specific context from database relationships.
 *
 * This service queries existing tables (timetable_slot, student_guardian,
 * student, staff/staff_mgmt) to build a ScopeContext that tells the
 * authorization system what data a user is allowed to access at each
 * scope level.
 *
 * For example, a teacher's allowed section IDs come from the
 * timetable_slot table where they're assigned.
 */
@Injectable()
export class ScopeResolverService {
  private readonly logger = new Logger(ScopeResolverService.name);
  private readonly cache = new Map<string, ScopeCacheEntry>();

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Resolve scope context for a given user within the current tenant.
   *
   * @param userId     - The authenticated user's ID
   * @param roleId     - The user's role ID (from RoleEnum)
   * @param tenantId   - Current tenant ID (null if pre-tenant)
   * @param branchId   - Current branch ID (null if no branch selected)
   */
  async resolve(
    userId: number,
    roleId: number,
    tenantId: string | null,
    branchId: string | null,
  ): Promise<ScopeContext> {
    if (!tenantId) {
      return this.emptyScopeContext();
    }

    const cacheKey = `${userId}:${tenantId}:${branchId ?? 'none'}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return this.cloneScopeContext(cached.scopeContext);
    }

    const context: ScopeContext = {
      allowedSectionIds: [],
      allowedStudentIds: [],
      staffId: null,
      studentId: null,
    };

    // Run resolutions in parallel
    const [sectionIds, studentIds, staffId, studentId] = await Promise.all([
      this.resolveTeacherSections(userId, tenantId, branchId),
      this.resolveParentStudents(userId, tenantId),
      this.resolveStaffId(userId, tenantId),
      this.resolveStudentId(userId, tenantId),
    ]);

    context.allowedSectionIds = sectionIds;
    context.allowedStudentIds = studentIds;
    context.staffId = staffId;
    context.studentId = studentId;

    // Cache result
    this.cache.set(cacheKey, {
      scopeContext: this.cloneScopeContext(context),
      expiresAt: Date.now() + SCOPE_CACHE_TTL_MS,
    });

    return context;
  }

  /**
   * For teachers: find section IDs they're assigned to via timetable_slot.
   * Uses the LMS staff table (which has userId → user mapping).
   */
  private async resolveTeacherSections(
    userId: number,
    tenantId: string,
    branchId: string | null,
  ): Promise<number[]> {
    try {
      let query = `
        SELECT DISTINCT ts."sectionId"
        FROM timetable_slot ts
        INNER JOIN staff s ON s.id = ts."staffId"
        WHERE s."userId" = $1
          AND ts."tenantId" = $2
          AND ts."deletedAt" IS NULL
          AND s."deletedAt" IS NULL
      `;
      const params: any[] = [userId, tenantId];

      if (branchId) {
        query += ` AND ts."branchId" = $${params.length + 1}`;
        params.push(branchId);
      }

      const rows: Array<{ sectionId: number }> = await this.dataSource.query(
        query,
        params,
      );

      return rows.map((r) => r.sectionId);
    } catch (err) {
      this.logger.warn(
        `Failed to resolve teacher sections for userId=${userId}: ${err}`,
      );
      return [];
    }
  }

  /**
   * For parents: find student IDs of their linked children via student_guardian.
   *
   * NOTE: The student_guardian table gets a userId column added by the
   * authorization migration. If the column doesn't exist yet, this returns [].
   */
  private async resolveParentStudents(
    userId: number,
    tenantId: string,
  ): Promise<number[]> {
    try {
      const rows: Array<{ studentId: number }> = await this.dataSource.query(
        `
        SELECT DISTINCT sg."studentId"
        FROM student_guardian sg
        INNER JOIN student s ON s.id = sg."studentId"
        WHERE sg."userId" = $1
          AND s."tenantId" = $2
          AND s."deletedAt" IS NULL
        `,
        [userId, tenantId],
      );

      return rows.map((r) => r.studentId);
    } catch (err) {
      // Expected to fail if userId column doesn't exist yet
      this.logger.debug(
        `Failed to resolve parent students for userId=${userId}: ${err}`,
      );
      return [];
    }
  }

  /**
   * Find the staff record ID for a user (from staff_mgmt, the feature module).
   * Falls back to the LMS staff table.
   */
  private async resolveStaffId(
    userId: number,
    tenantId: string,
  ): Promise<number | null> {
    try {
      // Try staff_mgmt first (feature module)
      const mgmtRows: Array<{ id: number }> = await this.dataSource.query(
        `
        SELECT id FROM staff_mgmt
        WHERE "userId" = $1 AND "tenantId" = $2 AND "deletedAt" IS NULL
        LIMIT 1
        `,
        [userId, tenantId],
      );

      if (mgmtRows.length > 0) {
        return mgmtRows[0].id;
      }

      // Fallback to LMS staff table
      const lmsRows: Array<{ id: number }> = await this.dataSource.query(
        `
        SELECT id FROM staff
        WHERE "userId" = $1 AND "tenantId" = $2 AND "deletedAt" IS NULL
        LIMIT 1
        `,
        [userId, tenantId],
      );

      return lmsRows.length > 0 ? lmsRows[0].id : null;
    } catch (err) {
      this.logger.warn(
        `Failed to resolve staffId for userId=${userId}: ${err}`,
      );
      return null;
    }
  }

  /**
   * Find the student record ID for a user.
   */
  private async resolveStudentId(
    userId: number,
    tenantId: string,
  ): Promise<number | null> {
    try {
      const rows: Array<{ id: number }> = await this.dataSource.query(
        `
        SELECT id FROM student
        WHERE "userId" = $1 AND "tenantId" = $2 AND "deletedAt" IS NULL
        LIMIT 1
        `,
        [userId, tenantId],
      );

      return rows.length > 0 ? rows[0].id : null;
    } catch (err) {
      this.logger.warn(
        `Failed to resolve studentId for userId=${userId}: ${err}`,
      );
      return null;
    }
  }

  /**
   * Invalidate scope cache for a user.
   */
  invalidateCache(userId?: number): void {
    if (userId !== undefined) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${userId}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  private emptyScopeContext(): ScopeContext {
    return {
      allowedSectionIds: [],
      allowedStudentIds: [],
      staffId: null,
      studentId: null,
    };
  }

  private cloneScopeContext(ctx: ScopeContext): ScopeContext {
    return {
      allowedSectionIds: [...ctx.allowedSectionIds],
      allowedStudentIds: [...ctx.allowedStudentIds],
      staffId: ctx.staffId,
      studentId: ctx.studentId,
    };
  }
}
