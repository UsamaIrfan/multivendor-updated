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

  @ApiPropertyOptional({ type: String, description: 'Letter grade (A/B/C)' })
  grade!: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Teacher feedback on the submission',
  })
  feedback!: string | null;

  @ApiPropertyOptional({
    type: Date,
    description: 'When the submission was graded',
  })
  gradedAt!: Date | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'ID of the user who graded',
  })
  gradedBy!: number | null;

  @ApiProperty({ type: Date })
  submittedAt!: Date;
}
