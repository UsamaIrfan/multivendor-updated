import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CourseMaterialTypeEnum } from '../../lms/common/enums/general.enum';
import { TenantAwareBaseDto } from '../../lms/common/dto/tenant-aware-base.dto';

export class CreateMaterialDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  subjectId!: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  uploadedById?: number | null;

  @ApiProperty({ example: 'Algebra Chapter 1 Notes' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'Detailed notes for algebra chapter 1' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    enum: CourseMaterialTypeEnum,
    default: CourseMaterialTypeEnum.document,
  })
  @IsOptional()
  @IsEnum(CourseMaterialTypeEnum)
  type?: CourseMaterialTypeEnum;

  @ApiPropertyOptional({
    example: 'tenant-uuid/materials/algebra-ch1.pdf',
    description: 'S3 file path (must start with tenant_id/materials/)',
  })
  @IsOptional()
  @IsString()
  filePath?: string | null;

  @ApiPropertyOptional({ example: 1024000, description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ example: 'https://example.com/resource' })
  @IsOptional()
  @IsString()
  externalUrl?: string | null;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
