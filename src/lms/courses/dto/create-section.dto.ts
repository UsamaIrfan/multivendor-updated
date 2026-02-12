import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  gradeClassId!: number;

  @ApiProperty({ example: 'Section A' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 40, default: 40 })
  @IsOptional()
  @IsInt()
  capacity?: number;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsInt()
  classTeacherId?: number | null;
}
