import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkMarkEntryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  studentId!: number;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  marksObtained?: number | null;
}

export class BulkMarksImportDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  examSubjectId!: number;

  @ApiProperty({ type: [BulkMarkEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkMarkEntryDto)
  data!: BulkMarkEntryDto[];
}
