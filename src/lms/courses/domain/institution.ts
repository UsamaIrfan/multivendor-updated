import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LmsBaseDomain } from '../../common/domain/lms-base.domain';

export class Institution extends LmsBaseDomain {
  @ApiProperty({ example: 'ABC School' })
  name: string;

  @ApiProperty({ example: 'ABC-001' })
  code: string;

  @ApiPropertyOptional()
  address: string | null;

  @ApiPropertyOptional()
  city: string | null;

  @ApiPropertyOptional()
  state: string | null;

  @ApiPropertyOptional()
  country: string | null;

  @ApiPropertyOptional()
  phone: string | null;

  @ApiPropertyOptional()
  email: string | null;

  @ApiPropertyOptional()
  website: string | null;

  @ApiPropertyOptional()
  logo: string | null;

  @ApiProperty({ default: true })
  isActive: boolean;
}
