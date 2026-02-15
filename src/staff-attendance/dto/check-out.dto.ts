import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { TenantAwareBaseDto } from '../../lms/common/dto/tenant-aware-base.dto';

export class CheckOutDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1, description: 'Staff ID (from staff_mgmt)' })
  @IsNotEmpty()
  @IsInt()
  staffId: number;
}
