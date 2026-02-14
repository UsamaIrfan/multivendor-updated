import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  tenantId: string;

  @ApiProperty({ example: 'Main Campus' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'MAIN-001' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;
}
