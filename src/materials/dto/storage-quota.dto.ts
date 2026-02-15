import { ApiProperty } from '@nestjs/swagger';

export class StorageQuotaDto {
  @ApiProperty({ type: String, format: 'uuid' })
  tenantId: string;

  @ApiProperty({
    example: 10737418240,
    description: 'Total quota in bytes (default 10 GB)',
  })
  quotaBytes: number;

  @ApiProperty({
    example: 1024000,
    description: 'Currently used storage in bytes',
  })
  usedBytes: number;

  @ApiProperty({
    example: 10736394240,
    description: 'Available storage in bytes',
  })
  availableBytes: number;
}
