import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';

/**
 * Assignment domain — represents a task assigned to students
 * within a tenant (optionally scoped to a branch).
 */
export class Assignment extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  subjectId!: number;

  @ApiProperty({ type: String })
  title!: string;

  @ApiPropertyOptional({ type: String })
  description!: string | null;

  @ApiProperty({ type: Date })
  dueDate!: Date;

  @ApiProperty({ type: Number })
  totalMarks!: number;

  @ApiProperty({ type: Boolean })
  isActive!: boolean;
}
