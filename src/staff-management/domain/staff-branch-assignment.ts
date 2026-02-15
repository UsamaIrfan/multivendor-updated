import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StaffBranchAssignment {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ type: String, format: 'uuid' })
  tenantId!: string;

  @ApiProperty({ example: 1 })
  staffEntityId!: number;

  @ApiProperty({ type: String, format: 'uuid' })
  branchId!: string;

  @ApiProperty({ example: ['teacher', 'coordinator'] })
  roles!: string[];

  @ApiProperty({ example: true })
  isPrimary!: boolean;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}
