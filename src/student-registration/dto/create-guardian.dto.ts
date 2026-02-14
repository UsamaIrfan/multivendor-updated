import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
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
}
