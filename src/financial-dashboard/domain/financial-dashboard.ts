import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TenantFinancialSummary {
  @ApiProperty({ example: 'tenant-uuid-1' })
  tenantId!: string;

  @ApiProperty({ example: 500000 })
  totalIncome!: number;

  @ApiProperty({ example: 300000 })
  totalExpense!: number;

  @ApiProperty({ example: 200000 })
  profit!: number;

  @ApiProperty({ example: 66.67 })
  profitMarginPercent!: number;

  @ApiPropertyOptional({ example: '2025-01-01' })
  startDate!: string | null;

  @ApiPropertyOptional({ example: '2025-12-31' })
  endDate!: string | null;
}

export class BranchFinancialDetail {
  @ApiProperty({ example: 'branch-uuid-1' })
  branchId!: string;

  @ApiProperty({ example: 'Main Campus' })
  branchName!: string;

  @ApiProperty({ example: 200000 })
  income!: number;

  @ApiProperty({ example: 120000 })
  expense!: number;

  @ApiProperty({ example: 80000 })
  profit!: number;

  @ApiProperty({ example: 40 })
  profitMarginPercent!: number;
}

export class HeadOfficeFinancial {
  @ApiProperty({ example: 50000 })
  income!: number;

  @ApiProperty({ example: 30000 })
  expense!: number;

  @ApiProperty({ example: 20000 })
  profit!: number;
}

export class CashFlowEntry {
  @ApiProperty({ example: '2025-01' })
  period!: string;

  @ApiProperty({ example: 50000 })
  income!: number;

  @ApiProperty({ example: 30000 })
  expense!: number;

  @ApiProperty({ example: 20000 })
  netCashFlow!: number;
}

export class FinancialDashboard {
  @ApiProperty({ type: TenantFinancialSummary })
  tenantSummary!: TenantFinancialSummary;

  @ApiProperty({ type: HeadOfficeFinancial })
  headOffice!: HeadOfficeFinancial;

  @ApiProperty({ type: [BranchFinancialDetail] })
  branchBreakdown!: BranchFinancialDetail[];
}

export class BranchProfitLoss {
  @ApiProperty({ example: 'branch-uuid-1' })
  branchId!: string;

  @ApiProperty({ example: 'Main Campus' })
  branchName!: string;

  @ApiProperty({ type: [CashFlowEntry] })
  cashFlow!: CashFlowEntry[];

  @ApiProperty({ example: 500000 })
  totalIncome!: number;

  @ApiProperty({ example: 300000 })
  totalExpense!: number;

  @ApiProperty({ example: 200000 })
  profit!: number;
}
