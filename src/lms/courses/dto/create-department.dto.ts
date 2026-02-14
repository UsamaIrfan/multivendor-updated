import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateDepartmentDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  institutionId!: number;

  @ApiProperty({ example: 'Science' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'SCI' })
  @IsNotEmpty()
  @IsString()
  code!: string;

  @ApiPropertyOptional({ example: 'Science department' })
  @IsOptional()
  @IsString()
  description?: string | null;
}
