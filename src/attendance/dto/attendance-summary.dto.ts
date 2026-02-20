import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class AttendanceSummaryQueryDto {
  @ApiProperty({ enum: ['student', 'staff'] })
  @IsString()
  attendableType: 'student' | 'staff';

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  attendableId: number;

  @ApiProperty({ example: '2025-12-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 'month', description: 'Group by month' })
  @IsOptional()
  @IsString()
  groupBy?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number for pagination' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;
}

export class AlertsQueryDto {
  @ApiPropertyOptional({ example: 75, default: 75 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  threshold?: number;

  @ApiPropertyOptional({ enum: ['student', 'staff'] })
  @IsOptional()
  @IsString()
  attendableType?: 'student' | 'staff';

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number for pagination' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;
}

export class DetailedReportQueryDto {
  @ApiProperty({ enum: ['student', 'staff'] })
  @IsString()
  attendableType: 'student' | 'staff';

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  attendableId: number;

  @ApiProperty({ example: '2025-12-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number for pagination' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;
}
