import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';

export class GradeClass extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  institutionId: number;

  @ApiProperty({ example: 'Grade 10' })
  name: string;

  @ApiPropertyOptional({ example: 10 })
  numericGrade: number | null;

  @ApiPropertyOptional()
  description: string | null;
}
