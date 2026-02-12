import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';

export class StudentDocument extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  studentId!: number;

  @ApiProperty({ type: String })
  documentType!: string;

  @ApiPropertyOptional({ type: String })
  fileId!: string | null;

  @ApiProperty({ type: Boolean })
  isVerified!: boolean;

  @ApiPropertyOptional({ type: String })
  remarks!: string | null;
}
