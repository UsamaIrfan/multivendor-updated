import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';


export class CreateStudentDocumentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  studentId: number;

  @ApiProperty({ example: 'Birth Certificate' })
  @IsNotEmpty()
  @IsString()
  documentType: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  fileId?: string | null;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ example: 'Original copy submitted' })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}
