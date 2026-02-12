import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { DayOfWeekEnum } from '../../common/enums/general.enum';

export class CreateTimetableSlotDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  sectionId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  subjectId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  staffId?: number | null;

  @ApiProperty({ enum: DayOfWeekEnum, example: DayOfWeekEnum.monday })
  @IsNotEmpty()
  @IsEnum(DayOfWeekEnum)
  dayOfWeek: DayOfWeekEnum;

  @ApiProperty({ example: '08:00' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ example: '08:45' })
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ example: 'Room 101' })
  @IsOptional()
  @IsString()
  room?: string | null;
}
