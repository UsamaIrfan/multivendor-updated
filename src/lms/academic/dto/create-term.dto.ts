import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateTermDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  academicYearId!: number;

  @ApiProperty({ example: 'Term 1' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: '2025-04-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2025-09-30' })
  @IsDateString()
  endDate!: string;
}
