import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenantAwareBaseDto } from '../../lms/common/dto/tenant-aware-base.dto';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBranchIncomeDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 'Tuition', description: 'Income category' })
  @IsNotEmpty()
  @IsString()
  category!: string;

  @ApiPropertyOptional({
    example: 'Monthly tuition fee collection',
    description: 'Description of income',
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    example: 50000.0,
    description: 'Amount received (decimal 12,2)',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: '2025-01-15', description: 'Date of income' })
  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    example: 'REF-2025-001',
    description: 'Reference number',
  })
  @IsOptional()
  @IsString()
  referenceNumber?: string | null;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Person/entity who made the payment',
  })
  @IsOptional()
  @IsString()
  receivedFrom?: string | null;

  @ApiPropertyOptional({
    example: 'First semester fees',
    description: 'Additional remarks',
  })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}
