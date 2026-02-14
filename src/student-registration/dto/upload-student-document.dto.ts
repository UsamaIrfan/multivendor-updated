import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadStudentDocumentDto {
  @ApiProperty({ example: 'Birth Certificate' })
  @IsNotEmpty()
  @IsString()
  documentType: string;

  @ApiPropertyOptional({ example: 'Original copy submitted' })
  @IsOptional()
  @IsString()
  remarks?: string | null;

  @ApiPropertyOptional({ description: 'File ID from upload service' })
  @IsOptional()
  @IsString()
  fileId?: string | null;
}
