import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';

export class Section extends LmsBaseDomain {
  @ApiProperty({ example: 1 })
  gradeClassId: number;

  @ApiPropertyOptional({ example: null })
  classTeacherId: number | null;

  @ApiProperty({ example: 'A' })
  name: string;

  @ApiProperty({ example: 40 })
  capacity: number;
}
