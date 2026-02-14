import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { FeeFrequencyEnum } from '../../common/enums/payment-status.enum';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateFeeStructureDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  institutionId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  gradeClassId?: number | null;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  academicYearId?: number | null;

  @ApiProperty({ example: 'Tuition Fee' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 5000.0 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    enum: FeeFrequencyEnum,
    default: FeeFrequencyEnum.monthly,
  })
  @IsOptional()
  @IsEnum(FeeFrequencyEnum)
  frequency?: FeeFrequencyEnum;

  @ApiPropertyOptional({ example: 'Monthly tuition fee' })
  @IsOptional()
  @IsString()
  description?: string | null;
}
