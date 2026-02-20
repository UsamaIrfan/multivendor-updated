import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum InvitationStatusEnum {
  pending = 'pending',
  accepted = 'accepted',
  expired = 'expired',
  cancelled = 'cancelled',
}

export class Invitation {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ type: String, format: 'uuid' })
  tenantId: string;

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  branchId: string | null;

  @ApiProperty()
  email: string;

  @ApiProperty({ description: 'Role ID to assign (RoleEnum value)' })
  roleId: number;

  @ApiProperty({ enum: InvitationStatusEnum })
  status: InvitationStatusEnum;

  @ApiProperty({ description: 'User ID of the admin who sent the invitation' })
  invitedBy: number;

  @ApiPropertyOptional({ description: 'Name of the tenant (populated)' })
  tenantName?: string;

  @ApiPropertyOptional({ description: 'Name of the branch (populated)' })
  branchName?: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt: Date;
}
