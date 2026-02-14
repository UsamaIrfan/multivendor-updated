import { ApiProperty } from '@nestjs/swagger';

/**
 * Download Record domain — tracks file downloads per tenant for analytics.
 */
export class DownloadRecord {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiProperty({ type: String, format: 'uuid' })
  tenantId!: string;

  @ApiProperty({ type: Number })
  materialId!: number;

  @ApiProperty({ type: Number })
  userId!: number;

  @ApiProperty({ type: Date })
  downloadedAt!: Date;
}
