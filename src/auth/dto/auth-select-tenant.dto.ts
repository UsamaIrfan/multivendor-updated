import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class AuthSelectTenantDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsNotEmpty()
  @IsString()
  @Matches(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    { message: 'tenantId must be a UUID' },
  )
  tenantId: string;
}
