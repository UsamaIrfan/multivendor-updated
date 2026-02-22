import { ApiProperty } from '@nestjs/swagger';
import { PermissionScopeEnum } from '../enums';

/**
 * RolePermission domain — maps a role to a permission with a scope.
 */
export class RolePermission {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  roleId: number;

  @ApiProperty({ type: Number })
  permissionId: number;

  @ApiProperty({ enum: PermissionScopeEnum })
  scope: PermissionScopeEnum;
}
