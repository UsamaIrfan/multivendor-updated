import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GradeDefinitionDto {
  @ApiProperty({ example: 90 })
  @IsNumber()
  @Min(0)
  @Max(100)
  minPercentage!: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  maxPercentage!: number;

  @ApiProperty({ example: 'A+' })
  @IsString()
  @IsNotEmpty()
  grade!: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  gradePoint!: number;

  @ApiPropertyOptional({ example: 'Outstanding' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateGradingScaleDto {
  @ApiProperty({ example: 'Standard Grading' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ type: [GradeDefinitionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeDefinitionDto)
  grades!: GradeDefinitionDto[];
}
