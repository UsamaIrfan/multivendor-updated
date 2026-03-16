import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TenantUser {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ type: String, format: 'uuid' })
  tenantId: string;

  @ApiPropertyOptional({ type: String, description: 'Name of the tenant' })
  tenantName?: string;

  @ApiProperty({ type: Number })
  userId: number;

  @ApiPropertyOptional({ type: String, description: 'Full name of the user' })
  userName?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Email address of the user',
  })
  userEmail?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Role ID of the user',
  })
  userRole?: number;

  @ApiProperty({ default: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt: Date;
}
