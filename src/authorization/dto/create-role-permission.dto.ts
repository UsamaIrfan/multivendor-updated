import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { PermissionScopeEnum } from '../enums';

export class CreateRolePermissionDto {
  @ApiProperty({ example: 1, description: 'Role ID (from RoleEnum)' })
  @IsNotEmpty()
  @IsInt()
  roleId: number;

  @ApiProperty({ example: 1, description: 'Permission ID' })
  @IsNotEmpty()
  @IsInt()
  permissionId: number;

  @ApiPropertyOptional({
    enum: PermissionScopeEnum,
    example: PermissionScopeEnum.TENANT,
    description: 'Scope level for this role-permission mapping',
  })
  @IsNotEmpty()
  @IsEnum(PermissionScopeEnum)
  scope: PermissionScopeEnum;
}
