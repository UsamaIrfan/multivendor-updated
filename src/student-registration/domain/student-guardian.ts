import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';

/**
 * StudentGuardian domain model - supports multiple guardians per student
 * with primary guardian designation.
 */
export class StudentGuardian extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  studentId!: number;

  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty({ type: String })
  phone!: string;

  @ApiPropertyOptional({ type: String })
  email!: string | null;

  @ApiProperty({ type: String })
  relation!: string;

  @ApiProperty({ type: Boolean, default: false })
  isPrimary!: boolean;
}
