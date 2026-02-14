import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Branch {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ type: String, format: 'uuid' })
  tenantId: string;

  @ApiProperty({ example: 'Main Campus' })
  name: string;

  @ApiProperty({ example: 'MAIN-001' })
  code: string;

  @ApiPropertyOptional()
  address: string | null;

  @ApiPropertyOptional()
  city: string | null;

  @ApiPropertyOptional()
  state: string | null;

  @ApiPropertyOptional()
  country: string | null;

  @ApiPropertyOptional()
  phone: string | null;

  @ApiPropertyOptional()
  email: string | null;

  @ApiProperty({ default: true })
  isActive: boolean;

  @ApiProperty({ default: false })
  isHeadquarters: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt: Date;
}
