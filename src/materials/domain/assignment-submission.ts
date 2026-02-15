import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';

/**
 * Assignment Submission domain — student submission for an assignment,
 * stored in tenant-specific S3 folder.
 */
export class AssignmentSubmission extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  assignmentId!: number;

  @ApiProperty({ type: Number })
  studentId!: number;

  @ApiPropertyOptional({
    type: String,
    description: 'S3 path: tenant_id/submissions/filename',
  })
  filePath!: string | null;

  @ApiProperty({ type: Number, description: 'File size in bytes' })
  fileSize!: number;

  @ApiPropertyOptional({ type: String })
  remarks!: string | null;

  @ApiPropertyOptional({ type: Number })
  marks!: number | null;

  @ApiProperty({ type: Date })
  submittedAt!: Date;
}
