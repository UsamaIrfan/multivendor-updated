import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';
import { CourseMaterialTypeEnum } from '../../lms/common/enums/general.enum';

/**
 * Enhanced Course Material domain with file storage, versioning,
 * and download tracking for multi-tenant usage.
 */
export class CourseMaterial extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  subjectId!: number;

  @ApiPropertyOptional({ type: Number })
  uploadedById!: number | null;

  @ApiProperty({ type: String })
  title!: string;

  @ApiPropertyOptional({ type: String })
  description!: string | null;

  @ApiProperty({ enum: CourseMaterialTypeEnum })
  type!: CourseMaterialTypeEnum;

  @ApiPropertyOptional({
    type: String,
    description: 'S3 path: tenant_id/materials/filename',
  })
  filePath!: string | null;

  @ApiProperty({
    type: Number,
    description: 'File size in bytes for quota tracking',
  })
  fileSize!: number;

  @ApiPropertyOptional({ type: String })
  externalUrl!: string | null;

  @ApiProperty({
    type: Number,
    description: 'Content version (incremented on file changes)',
  })
  version!: number;

  @ApiProperty({ type: Number, description: 'Total download count' })
  downloadCount!: number;

  @ApiProperty({ type: Boolean })
  isActive!: boolean;
}
