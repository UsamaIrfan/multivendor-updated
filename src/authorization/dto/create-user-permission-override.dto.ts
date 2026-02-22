import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { PermissionOverrideActionEnum, PermissionScopeEnum } from '../enums';

export class CreateUserPermissionOverrideDto {
  @ApiProperty({ example: 5, description: 'Target user ID' })
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @ApiProperty({
    example: 'a1b2c3d4-...',
    description: 'Tenant ID for the override',
  })
  @IsNotEmpty()
  @IsUUID()
  tenantId: string;

  @ApiProperty({ example: 1, description: 'Permission ID' })
  @IsNotEmpty()
  @IsInt()
  permissionId: number;

  @ApiProperty({
    enum: PermissionOverrideActionEnum,
    example: PermissionOverrideActionEnum.GRANT,
  })
  @IsNotEmpty()
  @IsEnum(PermissionOverrideActionEnum)
  action: PermissionOverrideActionEnum;

  @ApiPropertyOptional({
    enum: PermissionScopeEnum,
    description:
      'Optional scope override. If action=grant, this replaces the role default scope.',
  })
  @IsOptional()
  @IsEnum(PermissionScopeEnum)
  scope?: PermissionScopeEnum;
}
