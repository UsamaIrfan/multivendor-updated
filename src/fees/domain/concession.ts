import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';
import { ConcessionTypeEnum } from './concession-type.enum';

export class Concession extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  studentId!: number;

  @ApiProperty({ enum: ConcessionTypeEnum })
  type!: ConcessionTypeEnum;

  @ApiProperty({ type: Number })
  discountPercentage!: number;

  @ApiProperty({ type: Date })
  validFrom!: Date;

  @ApiProperty({ type: Date })
  validTo!: Date;

  @ApiPropertyOptional({ type: String })
  reason!: string | null;

  @ApiProperty({ type: Boolean })
  approved!: boolean;

  @ApiPropertyOptional({ type: Number })
  approvedBy!: number | null;
}
