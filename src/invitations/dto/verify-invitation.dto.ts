import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyInvitationDto {
  @ApiProperty({ description: 'JWT hash from the invitation email link' })
  @IsNotEmpty()
  @IsString()
  hash: string;
}
