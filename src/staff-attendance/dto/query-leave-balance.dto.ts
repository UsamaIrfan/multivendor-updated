import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { LeaveTypeEnum } from '../../lms/common/enums/leave-status.enum';

export class QueryLeaveBalanceDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  staffId?: number;

  @ApiPropertyOptional({ enum: LeaveTypeEnum })
  @IsOptional()
  @IsEnum(LeaveTypeEnum)
  leaveType?: LeaveTypeEnum;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ example: 1, description: 'Page number for pagination' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;
}
