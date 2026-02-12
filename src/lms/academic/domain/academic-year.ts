import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';

export class AcademicYear extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  institutionId!: number;

  @ApiProperty({ type: String, example: '2025-2026' })
  name!: string;

  @ApiProperty({ type: Date })
  startDate!: Date;

  @ApiProperty({ type: Date })
  endDate!: Date;

  @ApiPropertyOptional({ type: Boolean, example: false })
  isCurrent!: boolean;
}
