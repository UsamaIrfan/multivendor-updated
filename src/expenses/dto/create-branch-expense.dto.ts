import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenantAwareBaseDto } from '../../lms/common/dto/tenant-aware-base.dto';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ExpenseStatusEnum } from '../../lms/common/enums/general.enum';

export class CreateBranchExpenseDto extends TenantAwareBaseDto {
  @ApiProperty({ example: 'Utilities', description: 'Expense category' })
  @IsNotEmpty()
  @IsString()
  category!: string;

  @ApiPropertyOptional({
    example: 'Electricity bill for January',
    description: 'Description of expense',
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    example: 25000.0,
    description: 'Amount paid (decimal 12,2)',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: '2025-01-20', description: 'Date of expense' })
  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    example: 'REF-EXP-001',
    description: 'Reference number',
  })
  @IsOptional()
  @IsString()
  referenceNumber?: string | null;

  @ApiPropertyOptional({
    example: 'WAPDA',
    description: 'Person/entity paid to',
  })
  @IsOptional()
  @IsString()
  paidTo?: string | null;

  @ApiPropertyOptional({
    enum: ExpenseStatusEnum,
    default: ExpenseStatusEnum.pending,
    description: 'Expense status',
  })
  @IsOptional()
  @IsEnum(ExpenseStatusEnum)
  status?: ExpenseStatusEnum;

  @ApiPropertyOptional({
    example: 'Monthly bill',
    description: 'Additional remarks',
  })
  @IsOptional()
  @IsString()
  remarks?: string | null;
}
