import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TenantAwareBaseDto } from '../../lms/common/dto/tenant-aware-base.dto';

export class CreateNoticeDto extends TenantAwareBaseDto {
  @ApiProperty({
    type: [String],
    description:
      'Target branch UUIDs. Empty array = all branches in the tenant.',
    example: [],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  targetBranches?: string[];

  @ApiProperty({
    type: [String],
    description:
      'Target roles (e.g. "student", "staff", "parent"). Empty array = all roles.',
    example: ['student', 'staff'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetRoles?: string[];

  @ApiProperty({ example: 'Annual Day Celebration' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Details about the upcoming annual day event.' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Attachment file paths stored in tenant folder',
    example: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: '2026-07-01' })
  @IsOptional()
  @IsDateString()
  publishDate?: string | null;

  @ApiPropertyOptional({ example: '2026-08-01' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;
}
