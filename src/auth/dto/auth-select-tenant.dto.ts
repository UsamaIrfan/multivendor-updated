import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AuthSelectTenantDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  tenantId: string;
}
