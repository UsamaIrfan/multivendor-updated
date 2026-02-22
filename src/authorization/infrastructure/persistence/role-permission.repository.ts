import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { RolePermission } from '../../domain/role-permission';
import { PermissionScopeEnum } from '../../enums';

export interface EffectivePermissionRow {
  code: string;
  scope: PermissionScopeEnum;
}

export abstract class RolePermissionRepository {
  abstract create(data: DeepPartial<RolePermission>): Promise<RolePermission>;

  abstract findByRoleId(roleId: number): Promise<RolePermission[]>;

  /**
   * Returns effective permission codes + scopes for a role.
   * Joins with permission table to get codes.
   */
  abstract findEffectiveByRoleId(
    roleId: number,
  ): Promise<EffectivePermissionRow[]>;

  abstract remove(roleId: number, permissionId: number): Promise<void>;

  abstract removeAllByRoleId(roleId: number): Promise<void>;
}
