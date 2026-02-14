import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/domain/user';

export class Session {
  id: number | string;

  @ApiProperty({ type: String, format: 'uuid' })
  tenantId: string;

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  branchId: string | null;

  user: User;
  hash: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
