import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TenantAwareBaseDto } from '../../lms/common/dto/tenant-aware-base.dto';

export class SalaryComponentDto {
  @ApiProperty({ example: 'Basic Salary' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['earning', 'deduction'], example: 'earning' })
  @IsEnum(['earning', 'deduction'])
  type: 'earning' | 'deduction';

  @ApiProperty({ example: 50000 })
  @IsNumber()
  amount: number;
}

export class CreateSalaryStructureDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  staffId: number;

  @ApiProperty({ example: 'Standard Teacher Structure' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: [SalaryComponentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalaryComponentDto)
  components: SalaryComponentDto[];

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
