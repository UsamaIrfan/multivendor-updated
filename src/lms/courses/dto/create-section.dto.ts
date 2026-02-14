import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateSectionDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  gradeClassId!: number;

  @ApiProperty({ example: 'Section A' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 40, default: 40 })
  @IsOptional()
  @IsInt()
  capacity?: number;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsInt()
  classTeacherId?: number | null;
}
