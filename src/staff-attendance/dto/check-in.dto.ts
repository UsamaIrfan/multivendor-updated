import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TenantAwareBaseDto } from '../../lms/common/dto/tenant-aware-base.dto';

export class CheckInDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1, description: 'Staff ID (from staff_mgmt)' })
  @IsNotEmpty()
  @IsInt()
  staffId: number;

  @ApiPropertyOptional({ example: 'Arrived on time' })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}
