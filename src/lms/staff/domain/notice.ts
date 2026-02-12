import { ApiProperty } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { TargetAudienceEnum } from '../../common/enums/general.enum';

export class Notice extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  institutionId!: number;

  @ApiProperty({ example: 1, nullable: true })
  publishedById!: number | null;

  @ApiProperty({ example: 'Annual Day Celebration' })
  title!: string;

  @ApiProperty({ example: 'Details about the upcoming annual day event.' })
  content!: string;

  @ApiProperty({ enum: TargetAudienceEnum })
  targetAudience!: TargetAudienceEnum;

  @ApiProperty({ example: true })
  isPublished!: boolean;

  @ApiProperty({ example: '2024-01-15', nullable: true })
  publishDate!: Date | null;

  @ApiProperty({ example: '2024-02-15', nullable: true })
  expiryDate!: Date | null;
}
