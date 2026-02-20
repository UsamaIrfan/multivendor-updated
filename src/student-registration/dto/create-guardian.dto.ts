import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateGuardianDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '+1555000001' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'jane@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiProperty({ example: 'Mother' })
  @IsNotEmpty()
  @IsString()
  relation: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  // ─── Auto-create parent user account ───────────────────
  @ApiPropertyOptional({
    example: true,
    default: false,
    description:
      'When true and email is provided, a User account with role "parent" will be auto-created for this guardian.',
  })
  @IsOptional()
  @IsBoolean()
  createUserAccount?: boolean;

  @ApiPropertyOptional({
    example: 'password123',
    description: 'Password for the parent user account (required when createUserAccount is true)',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
