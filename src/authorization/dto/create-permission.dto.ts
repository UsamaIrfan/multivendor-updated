import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'academic.student.read',
    description: 'Dot-notation permission code: <domain>.<resource>.<action>',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z]+(\.[a-z_]+){1,3}$/, {
    message: 'code must be dot-notation lowercase, e.g. academic.student.read',
  })
  code: string;

  @ApiProperty({
    example: 'academic',
    description: 'Permission domain grouping',
  })
  @IsNotEmpty()
  @IsString()
  domain: string;

  @ApiPropertyOptional({
    example: 'View student records',
    description: 'Human-readable description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
