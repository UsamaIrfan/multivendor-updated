import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApproveStaffLeaveDto {
  @ApiPropertyOptional({ example: 'Approved by admin' })
  @IsOptional()
  @IsString()
  adminRemarks?: string;
}

export class RejectStaffLeaveDto {
  @ApiPropertyOptional({ example: 'Insufficient documentation' })
  @IsOptional()
  @IsString()
  adminRemarks?: string;
}
