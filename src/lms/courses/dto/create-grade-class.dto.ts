import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGradeClassDto {
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
