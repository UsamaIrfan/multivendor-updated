import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../lms/common/domain/lms-base.domain';

export class GradeDefinitionDomain {
  @ApiProperty()
  minPercentage!: number;

  @ApiProperty()
  maxPercentage!: number;

  @ApiProperty()
  grade!: string;

  @ApiProperty()
  gradePoint!: number;

  @ApiPropertyOptional()
  description?: string;
}

export class GradingScale extends LmsBaseDomain {
  @ApiProperty()
  name!: string;

  @ApiProperty({ type: () => [GradeDefinitionDomain] })
  grades!: GradeDefinitionDomain[];
}
