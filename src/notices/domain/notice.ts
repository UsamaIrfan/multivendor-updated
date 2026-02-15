import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';

export class Notice extends LmsBaseDomain {
  @ApiProperty({ type: String, format: 'uuid' })
  declare id: any; // UUID — overrides number from LmsBaseDomain

  @ApiProperty({
    type: [String],
    description:
      'Target branch UUIDs. Empty array means all branches in tenant.',
    example: [],
  })
  targetBranches: string[];

  @ApiProperty({
    type: [String],
    description:
      'Target roles (e.g. student, staff, parent). Empty array means all roles.',
    example: ['student', 'staff'],
  })
  targetRoles: string[];

  @ApiProperty({ example: 'Annual Day Celebration' })
  title: string;

  @ApiProperty({ example: 'Details about the upcoming annual day event.' })
  content: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Attachment file paths stored in tenant folder',
    example: [],
  })
  attachments: string[] | null;

  @ApiProperty({ example: true })
  isPublished: boolean;

  @ApiPropertyOptional({ type: Date, nullable: true })
  publishDate: Date | null;

  @ApiPropertyOptional({ type: Date, nullable: true })
  expiresAt: Date | null;
}
