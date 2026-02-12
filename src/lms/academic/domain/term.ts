import { ApiProperty } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';

export class Term extends LmsBaseDomain {
  @ApiProperty({ type: Number })
  academicYearId!: number;

  @ApiProperty({ type: String, example: 'Term 1' })
  name!: string;

  @ApiProperty({ type: Date })
  startDate!: Date;

  @ApiProperty({ type: Date })
  endDate!: Date;
}
