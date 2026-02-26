import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddPeriodDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  timetableId: string;

  @ApiProperty({ type: Number, example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  subjectId: number;

  @ApiProperty({ type: Number, example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  teacherId: number;

  @ApiProperty({ example: 1, description: '0=Sunday … 6=Saturday' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '08:00' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be in HH:mm format' })
  startTime: string;

  @ApiProperty({ example: '08:45' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be in HH:mm format' })
  endTime: string;

  @ApiPropertyOptional({ example: 'Room 101' })
  @IsOptional()
  @IsString()
  room?: string | null;
}
