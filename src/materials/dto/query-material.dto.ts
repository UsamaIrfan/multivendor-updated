import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CourseMaterialTypeEnum } from '../../lms/common/enums/general.enum';

export class QueryMaterialDto {
  @ApiPropertyOptional({ example: 1, description: 'Filter by subject ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  subjectId?: number;

  @ApiPropertyOptional({
    enum: CourseMaterialTypeEnum,
    description: 'Filter by material type',
  })
  @IsOptional()
  @IsEnum(CourseMaterialTypeEnum)
  type?: CourseMaterialTypeEnum;

  @ApiPropertyOptional({
    example: 'algebra',
    description: 'Search by title (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
