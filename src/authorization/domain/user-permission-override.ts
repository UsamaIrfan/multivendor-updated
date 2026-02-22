import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionOverrideActionEnum, PermissionScopeEnum } from '../enums';

/**
 * UserPermissionOverride domain — per-user permission grant/revoke within a tenant.
 */
export class UserPermissionOverride {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  userId: number;

  @ApiProperty({ type: String, format: 'uuid' })
  tenantId: string;

  @ApiProperty({ type: Number })
  permissionId: number;

  @ApiProperty({ enum: PermissionOverrideActionEnum })
  action: PermissionOverrideActionEnum;

  @ApiPropertyOptional({ enum: PermissionScopeEnum })
  scope: PermissionScopeEnum | null;

  @ApiPropertyOptional({ type: Number })
  grantedBy: number | null;

  @ApiProperty()
  createdAt: Date;
}
