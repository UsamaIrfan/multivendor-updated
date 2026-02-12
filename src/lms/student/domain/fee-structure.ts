import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';
import { FeeFrequencyEnum } from '../../common/enums/payment-status.enum';

export class FeeStructure extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  institutionId!: number;

  @ApiPropertyOptional({ type: Number })
  gradeClassId!: number | null;

  @ApiPropertyOptional({ type: Number })
  academicYearId!: number | null;

  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty({ type: Number })
  amount!: number;

  @ApiProperty({ enum: FeeFrequencyEnum })
  frequency!: FeeFrequencyEnum;

  @ApiPropertyOptional({ type: String })
  description!: string | null;
}
