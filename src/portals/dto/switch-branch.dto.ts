import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class SwitchBranchDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Branch ID to switch to',
  })
  @IsNotEmpty()
  @IsUUID()
  branchId: string;
}
