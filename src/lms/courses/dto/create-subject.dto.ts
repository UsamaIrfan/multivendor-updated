import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  departmentId!: number;

  @ApiProperty({ example: 'Mathematics' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'MATH-101' })
  @IsNotEmpty()
  @IsString()
  code!: string;

  @ApiPropertyOptional({ example: 3, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  creditHours?: number;

  @ApiPropertyOptional({ example: 'Basic mathematics' })
  @IsOptional()
  @IsString()
  description?: string | null;
}
