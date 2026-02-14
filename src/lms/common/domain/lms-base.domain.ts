import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Base domain class for all LMS entities.
 * Following the boilerplate's hexagonal architecture —
 * domain classes are pure POJOs with no ORM dependencies.
 */
export class LmsBaseDomain {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String, format: 'uuid' })
  tenantId: string;

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  branchId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt: Date;
}
