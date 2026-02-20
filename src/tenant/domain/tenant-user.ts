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

  @ApiProperty({ default: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt: Date;
}
