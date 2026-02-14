import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Tenant {
  @ApiProperty({ type: String, format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'ABC Education Group' })
  name: string;

  @ApiProperty({ example: 'abc-education' })
  slug: string;

  @ApiPropertyOptional({ example: 'admin@abc-education.com' })
  contactEmail: string | null;

  @ApiPropertyOptional({ example: '+1234567890' })
  contactPhone: string | null;

  @ApiProperty({ default: true })
  isActive: boolean;

  @ApiPropertyOptional({ type: Object })
  settings: Record<string, unknown> | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt: Date;
}
