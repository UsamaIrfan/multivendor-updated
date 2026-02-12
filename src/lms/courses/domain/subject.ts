import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';

export class Subject extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  departmentId: number;

  @ApiProperty({ example: 'Mathematics' })
  name: string;

  @ApiProperty({ example: 'MATH-101' })
  code: string;

  @ApiProperty({ example: 3 })
  creditHours: number;

  @ApiPropertyOptional()
  description: string | null;
}
