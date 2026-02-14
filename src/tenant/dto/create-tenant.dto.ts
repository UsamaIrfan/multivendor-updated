import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'ABC Education Group' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'abc-education',
    description: 'URL-safe slug for subdomain routing',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  slug: string;

  @ApiPropertyOptional({ example: 'admin@abc-education.com' })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  contactPhone?: string;
}
