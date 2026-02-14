import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class AssignUserToTenantDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  tenantId: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
