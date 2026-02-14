import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class EnrollStudentDto {
  @ApiProperty({ example: 1, description: 'Section ID' })
  @IsNotEmpty()
  @IsInt()
  sectionId: number;

  @ApiProperty({ example: 1, description: 'Academic Year ID' })
  @IsNotEmpty()
  @IsInt()
  academicYearId: number;
}
