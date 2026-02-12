import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDto {
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
