import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SalaryStatusEnum } from '../../common/enums/general.enum';
import { TenantAwareBaseDto } from '../../common/dto/tenant-aware-base.dto';

export class CreateSalarySlipDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  staffId: number;

  @ApiProperty({ example: 7, description: 'Month (1-12)' })
  @IsInt()
  month: number;

  @ApiProperty({ example: 2025 })
  @IsInt()
  year: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  basicSalary: number;

  @ApiPropertyOptional({ example: 5000, default: 0 })
  @IsOptional()
  @IsNumber()
  allowances?: number;

  @ApiPropertyOptional({ example: 2000, default: 0 })
  @IsOptional()
  @IsNumber()
  deductions?: number;

  @ApiProperty({ example: 53000 })
  @IsNumber()
  netSalary: number;

  @ApiPropertyOptional({ example: 26, default: 0 })
  @IsOptional()
  @IsInt()
  workingDays?: number;

  @ApiPropertyOptional({ example: 24, default: 0 })
  @IsOptional()
  @IsInt()
  presentDays?: number;

  @ApiPropertyOptional({
    enum: SalaryStatusEnum,
    default: SalaryStatusEnum.draft,
  })
  @IsOptional()
  @IsEnum(SalaryStatusEnum)
  status?: SalaryStatusEnum;

  @ApiPropertyOptional({ example: '2025-07-31T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  paidAt?: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}
