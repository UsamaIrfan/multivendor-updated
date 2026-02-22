import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { UserPermissionOverride } from '../../domain/user-permission-override';
import { PermissionOverrideActionEnum, PermissionScopeEnum } from '../../enums';

export interface UserOverrideRow {
  code: string;
  action: PermissionOverrideActionEnum;
  scope: PermissionScopeEnum | null;
}

export abstract class UserPermissionOverrideRepository {
  abstract create(
    data: DeepPartial<UserPermissionOverride>,
  ): Promise<UserPermissionOverride>;

  abstract findByUserAndTenant(
    userId: number,
    tenantId: string,
  ): Promise<UserPermissionOverride[]>;

  /**
   * Returns override rows with permission codes for efficient resolution.
   */
  abstract findOverridesByUserAndTenant(
    userId: number,
    tenantId: string,
  ): Promise<UserOverrideRow[]>;

  abstract remove(id: number): Promise<void>;

  abstract removeByUserAndTenant(
    userId: number,
    tenantId: string,
    permissionId: number,
  ): Promise<void>;
}
