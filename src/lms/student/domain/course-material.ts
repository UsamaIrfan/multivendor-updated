import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { CourseMaterialTypeEnum } from '../../common/enums/general.enum';

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

  @ApiPropertyOptional({ type: String })
  fileId!: string | null;

  @ApiPropertyOptional({ type: String })
  externalUrl!: string | null;

  @ApiProperty({ type: Boolean })
  isActive!: boolean;
}
