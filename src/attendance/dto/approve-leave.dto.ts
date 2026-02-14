import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ApproveLeaveDto {
  @ApiPropertyOptional({ example: 'Approved for the requested dates' })
  @IsOptional()
  @IsString()
  adminRemarks?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  approvedById?: number;
}

export class RejectLeaveDto {
  @ApiPropertyOptional({ example: 'Insufficient staff coverage' })
  @IsOptional()
  @IsString()
  adminRemarks?: string;
}
