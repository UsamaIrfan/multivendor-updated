import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { TenantAwareBaseDto } from '../../lms/common/dto/tenant-aware-base.dto';

export class TransferBranchDto extends TenantAwareBaseDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  fromBranchId: string;

  @ApiProperty({ type: String, format: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  toBranchId: string;
}
