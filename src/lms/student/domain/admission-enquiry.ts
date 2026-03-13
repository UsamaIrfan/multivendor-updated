import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { AdmissionStatusEnum } from '../../common/enums/admission-status.enum';
import { EnquirySourceEnum } from '../../common/enums/general.enum';

export class AdmissionEnquiry extends LmsBaseDomain {
  @ApiPropertyOptional({ type: Number })
  institutionId!: number | null;

  @ApiProperty({ type: String })
  studentName!: string;

  @ApiPropertyOptional({ type: String })
  guardianName!: string | null;

  @ApiPropertyOptional({ type: String })
  phone!: string | null;

  @ApiPropertyOptional({ type: String })
  email!: string | null;

  @ApiPropertyOptional({ type: String })
  previousSchool!: string | null;

  @ApiPropertyOptional({ type: String })
  gradeApplyingFor!: string | null;

  @ApiProperty({ enum: AdmissionStatusEnum })
  status!: AdmissionStatusEnum;

  @ApiProperty({ enum: EnquirySourceEnum })
  source!: EnquirySourceEnum;

  @ApiPropertyOptional({ type: String })
  notes!: string | null;

  @ApiPropertyOptional({ type: Date })
  followUpDate!: Date | null;

  @ApiPropertyOptional({ type: Number })
  convertedStudentId!: number | null;
}
