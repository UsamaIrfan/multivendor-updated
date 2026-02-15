import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { BranchIncome } from '../../domain/branch-income';

export interface IncomeReportOptions {
  tenantId: string;
  startDate?: string;
  endDate?: string;
  branchId?: string;
  category?: string;
}

export interface BranchIncomeSummary {
  branchId: string | null;
  totalAmount: number;
  count: number;
}

export abstract class BranchIncomeRepository {
  abstract create(data: DeepPartial<BranchIncome>): Promise<BranchIncome>;
  abstract findAll(): Promise<BranchIncome[]>;
  abstract findById(
    id: BranchIncome['id'],
  ): Promise<NullableType<BranchIncome>>;
  abstract update(
    id: BranchIncome['id'],
    data: DeepPartial<BranchIncome>,
  ): Promise<BranchIncome | null>;
  abstract remove(id: BranchIncome['id']): Promise<void>;
  abstract findByDateRange(
    options: IncomeReportOptions,
  ): Promise<BranchIncome[]>;
  abstract getConsolidatedReport(
    options: IncomeReportOptions,
  ): Promise<BranchIncomeSummary[]>;
  abstract getTotalByTenant(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number>;
  abstract getTotalByBranch(
    tenantId: string,
    branchId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number>;
}
