import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateInstitutionDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 'Springfield Academy' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'SPR-001' })
  @IsNotEmpty()
  @IsString()
  code!: string;

  @ApiPropertyOptional({ example: '123 Main Street' })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional({ example: 'Springfield' })
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiPropertyOptional({ example: 'Illinois' })
  @IsOptional()
  @IsString()
  state?: string | null;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @IsString()
  country?: string | null;

  @ApiPropertyOptional({ example: '+1-555-0100' })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiPropertyOptional({ example: 'info@springfield.edu' })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({ example: 'https://springfield.edu' })
  @IsOptional()
  @IsUrl()
  website?: string | null;

  @ApiPropertyOptional({ example: 'https://springfield.edu/logo.png' })
  @IsOptional()
  @IsString()
  logo?: string | null;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
