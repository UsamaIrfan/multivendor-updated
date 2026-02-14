import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TenantAwareBaseDto } from '../../lms/common/dto/tenant-aware-base.dto';

export class SubmitAssignmentDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1, description: 'Student ID submitting the assignment' })
  @IsInt()
  studentId!: number;

  @ApiPropertyOptional({
    example: 'tenant-uuid/submissions/homework1-solution.pdf',
    description: 'S3 path for submission file',
  })
  @IsOptional()
  @IsString()
  filePath?: string | null;

  @ApiPropertyOptional({ example: 256000, description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ example: 'Completed all exercises' })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}
