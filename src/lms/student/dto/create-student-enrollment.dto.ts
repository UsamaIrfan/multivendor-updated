import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { EnrollmentStatusEnum } from '../../common/enums/general.enum';

export class CreateStudentEnrollmentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  studentId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  sectionId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  academicYearId: number;

  @ApiPropertyOptional({
    enum: EnrollmentStatusEnum,
    default: EnrollmentStatusEnum.active,
  })
  @IsOptional()
  @IsEnum(EnrollmentStatusEnum)
  status?: EnrollmentStatusEnum;

  @ApiPropertyOptional({ example: '2025-04-01' })
  @IsOptional()
  @IsDateString()
  enrollmentDate?: string | null;
}
