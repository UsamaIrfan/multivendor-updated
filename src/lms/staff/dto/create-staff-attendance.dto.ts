import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { AttendanceStatusEnum } from '../../common/enums/attendance-status.enum';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateStaffAttendanceDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  staffId: number;

  @ApiProperty({ example: '2025-07-01' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    enum: AttendanceStatusEnum,
    default: AttendanceStatusEnum.present,
  })
  @IsOptional()
  @IsEnum(AttendanceStatusEnum)
  status?: AttendanceStatusEnum;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString()
  checkIn?: string | null;

  @ApiPropertyOptional({ example: '16:00' })
  @IsOptional()
  @IsString()
  checkOut?: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}
