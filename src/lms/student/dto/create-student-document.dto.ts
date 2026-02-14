import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateStudentDocumentDto extends TenantAwareBaseDto {
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
