import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { RoleEnum } from '../../roles/roles.enum';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CreateInvitationDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: RoleEnum,
    example: RoleEnum.student,
    description: 'Role to assign: 3=student, 4=teacher, 5=staff, 6=accountant, 7=parent',
  })
  @IsNotEmpty()
  @IsInt()
  roleId: number;

  @ApiProperty({ type: String, format: 'uuid' })
  @IsNotEmpty()
  @IsString()
  @Matches(UUID_REGEX, { message: 'tenantId must be a UUID' })
  tenantId: string;

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  @IsOptional()
  @IsString()
  @Matches(UUID_REGEX, { message: 'branchId must be a UUID' })
  branchId?: string | null;
}
