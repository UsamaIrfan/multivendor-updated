import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { BranchExpense } from '../../domain/branch-expense';

export interface ExpenseReportOptions {
  tenantId: string;
  startDate?: string;
  endDate?: string;
  branchId?: string;
  category?: string;
}

export interface BranchExpenseSummary {
  branchId: string | null;
  totalAmount: number;
  count: number;
}

export abstract class BranchExpenseRepository {
  abstract create(data: DeepPartial<BranchExpense>): Promise<BranchExpense>;
  abstract findAll(): Promise<BranchExpense[]>;
  abstract findById(
    id: BranchExpense['id'],
  ): Promise<NullableType<BranchExpense>>;
  abstract update(
    id: BranchExpense['id'],
    data: DeepPartial<BranchExpense>,
  ): Promise<BranchExpense | null>;
  abstract remove(id: BranchExpense['id']): Promise<void>;
  abstract findByDateRange(
    options: ExpenseReportOptions,
  ): Promise<BranchExpense[]>;
  abstract getConsolidatedReport(
    options: ExpenseReportOptions,
  ): Promise<BranchExpenseSummary[]>;
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
