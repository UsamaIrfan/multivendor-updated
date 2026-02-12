import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';

export class Department extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  institutionId: number;

  @ApiProperty({ example: 'Science' })
  name: string;

  @ApiProperty({ example: 'SCI' })
  code: string;

  @ApiPropertyOptional()
  description: string | null;
}
