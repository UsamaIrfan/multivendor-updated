import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { LeaveStatusEnum } from '../../common/enums/leave-status.enum';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateLeaveRequestDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  studentId: number;

  @ApiProperty({ example: '2025-06-20' })
  @IsDateString()
  fromDate: string;

  @ApiProperty({ example: '2025-06-22' })
  @IsDateString()
  toDate: string;

  @ApiProperty({ example: 'Family event' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    enum: LeaveStatusEnum,
    default: LeaveStatusEnum.pending,
  })
  @IsOptional()
  @IsEnum(LeaveStatusEnum)
  status?: LeaveStatusEnum;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsInt()
  approvedById?: number | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  adminRemarks?: string | null;
}
