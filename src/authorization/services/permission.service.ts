import { Injectable, Logger } from '@nestjs/common';
import { RolePermissionRepository } from '../infrastructure/persistence/role-permission.repository';
import { UserPermissionOverrideRepository } from '../infrastructure/persistence/user-permission-override.repository';
import { PermissionRepository } from '../infrastructure/persistence/permission.repository';
import { PermissionOverrideActionEnum, PermissionScopeEnum } from '../enums';
import { EffectivePermission } from '../domain/authorization-context';
import { Permission } from '../domain/permission';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto';
import { NullableType } from '../../utils/types/nullable.type';

/**
 * Cache entry shape for in-memory permission resolution cache.
 */
interface CacheEntry {
  permissions: Map<string, PermissionScopeEnum>;
  expiresAt: number;
}

const CACHE_TTL_MS = 60_000; // 60 seconds

/**
 * Resolves effective permissions for a user within a tenant.
 *
 * Resolution algorithm:
 * 1. Fetch role-level defaults from `role_permission` (code → scope)
 * 2. Fetch user-level overrides from `user_permission_override`
 * 3. Merge: REVOKE removes, GRANT adds/upgrades scope
 * 4. Return final Map<code, scope>
 *
 * Results are cached per (roleId, userId, tenantId) with 60s TTL.
 */
@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  /** In-memory permission cache: cacheKey → { permissions, expiresAt } */
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    private readonly permissionRepo: PermissionRepository,
    private readonly rolePermissionRepo: RolePermissionRepository,
    private readonly userOverrideRepo: UserPermissionOverrideRepository,
  ) {}

  // ─── Permission CRUD ─────────────────────────────────────

  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    return this.permissionRepo.create(dto);
  }

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepo.findAll();
  }

  async findPermissionById(id: number): Promise<NullableType<Permission>> {
    return this.permissionRepo.findById(id);
  }

  async findPermissionsByDomain(domain: string): Promise<Permission[]> {
    return this.permissionRepo.findByDomain(domain);
  }

  async updatePermission(
    id: number,
    dto: UpdatePermissionDto,
  ): Promise<Permission | null> {
    return this.permissionRepo.update(id, dto);
  }

  async removePermission(id: number): Promise<void> {
    return this.permissionRepo.remove(id);
  }

  // ─── Effective Permission Resolution ──────────────────────

  /**
   * Resolve the effective permission set for a user.
   *
   * @param roleId     - The user's role ID (from RoleEnum)
   * @param userId     - The user's ID
   * @param tenantId   - The current tenant (null = pre-tenant context)
   * @returns Map of permission code → scope
   */
  async resolveEffectivePermissions(
    roleId: number,
    userId: number,
    tenantId: string | null,
  ): Promise<Map<string, PermissionScopeEnum>> {
    const cacheKey = `${roleId}:${userId}:${tenantId ?? 'none'}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return new Map(cached.permissions); // return copy to prevent mutation
    }

    // 1. Get role-level defaults
    const rolePerms =
      await this.rolePermissionRepo.findEffectiveByRoleId(roleId);

    const permMap = new Map<string, PermissionScopeEnum>();
    for (const rp of rolePerms) {
      permMap.set(rp.code, rp.scope);
    }

    // 2. Apply user-level overrides (only if within a tenant)
    if (tenantId) {
      const overrides =
        await this.userOverrideRepo.findOverridesByUserAndTenant(
          userId,
          tenantId,
        );

      for (const ov of overrides) {
        if (ov.action === PermissionOverrideActionEnum.REVOKE) {
          permMap.delete(ov.code);
        } else if (ov.action === PermissionOverrideActionEnum.GRANT) {
          // GRANT: add permission with specified scope, or keep role default scope
          const scope =
            ov.scope ?? permMap.get(ov.code) ?? PermissionScopeEnum.TENANT;
          permMap.set(ov.code, scope);
        }
      }
    }

    // 3. Cache result
    this.cache.set(cacheKey, {
      permissions: new Map(permMap),
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return permMap;
  }

  /**
   * Invalidate the permission cache for a specific user/role/tenant combo.
   * Call this after modifying role permissions or user overrides.
   */
  invalidateCache(roleId?: number, userId?: number, tenantId?: string): void {
    if (roleId !== undefined && userId !== undefined) {
      const key = `${roleId}:${userId}:${tenantId ?? 'none'}`;
      this.cache.delete(key);
      return;
    }

    // If partial args, do a prefix scan to clear related entries
    const prefix = roleId !== undefined ? `${roleId}:` : '';
    for (const key of this.cache.keys()) {
      if (prefix && key.startsWith(prefix)) {
        this.cache.delete(key);
      } else if (userId !== undefined && key.includes(`:${userId}:`)) {
        this.cache.delete(key);
      }
    }

    // Full flush if no args
    if (
      roleId === undefined &&
      userId === undefined &&
      tenantId === undefined
    ) {
      this.cache.clear();
      this.logger.debug('Permission cache fully flushed');
    }
  }

  /**
   * Convert an effective permission map to an array of EffectivePermission.
   */
  toEffectivePermissionArray(
    permMap: Map<string, PermissionScopeEnum>,
  ): EffectivePermission[] {
    return Array.from(permMap.entries()).map(([code, scope]) => ({
      code,
      scope,
    }));
  }
}
