import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CourseMaterialTypeEnum } from '../../common/enums/general.enum';

export class CreateCourseMaterialDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  subjectId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  uploadedById?: number | null;

  @ApiProperty({ example: 'Chapter 5 – Algebra Notes' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Detailed notes for algebra chapter' })
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

  @ApiPropertyOptional({ example: 'cbcfa8b8-...' })
  @IsOptional()
  @IsString()
  fileId?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/resource' })
  @IsOptional()
  @IsString()
  externalUrl?: string | null;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
