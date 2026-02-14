import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class GenerateChallanDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  studentId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  feeStructureId: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  installmentIndex?: number;

  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  dueDate: string;
}

export class GenerateBulkChallanDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  gradeClassId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  feeStructureId: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  installmentIndex?: number;

  @ApiProperty({ example: '2026-07-15' })
  @IsDateString()
  dueDate: string;
}
