import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { EnrollmentStatusEnum } from '../../common/enums/general.enum';

export class StudentEnrollment extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  studentId!: number;

  @ApiProperty({ type: Number })
  sectionId!: number;

  @ApiProperty({ type: Number })
  academicYearId!: number;

  @ApiProperty({ enum: EnrollmentStatusEnum })
  status!: EnrollmentStatusEnum;

  @ApiPropertyOptional({ type: Date })
  enrollmentDate!: Date | null;
}
