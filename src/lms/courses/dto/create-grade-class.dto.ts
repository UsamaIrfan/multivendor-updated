import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateGradeClassDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  institutionId!: number;

  @ApiProperty({ example: 'Grade 1' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  numericGrade?: number | null;

  @ApiPropertyOptional({ example: 'First grade' })
  @IsOptional()
  @IsString()
  description?: string | null;
}
