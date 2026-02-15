import { Injectable } from '@nestjs/common';
import { TenantContextService } from '../tenant/tenant-context/tenant-context.service';
import { BranchIncomeRepository } from '../income/infrastructure/persistence/branch-income.repository';
import { BranchExpenseRepository } from '../expenses/infrastructure/persistence/branch-expense.repository';
import { BranchRepository } from '../tenant/infrastructure/persistence/branch.repository';
import { FinancialDashboardQueryDto } from './dto/financial-dashboard-query.dto';
import {
  BranchFinancialDetail,
  BranchProfitLoss,
  CashFlowEntry,
  FinancialDashboard,
  HeadOfficeFinancial,
  TenantFinancialSummary,
} from './domain/financial-dashboard';

@Injectable()
export class FinancialDashboardService {
  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly incomeRepo: BranchIncomeRepository,
    private readonly expenseRepo: BranchExpenseRepository,
    private readonly branchRepo: BranchRepository,
  ) {}

  async getFinancialDashboard(
    query: FinancialDashboardQueryDto,
  ): Promise<FinancialDashboard> {
    const tenantId = this.tenantContext.getTenantId();

    const [totalIncome, totalExpense, branches] = await Promise.all([
      this.incomeRepo.getTotalByTenant(
        tenantId,
        query.startDate,
        query.endDate,
      ),
      this.expenseRepo.getTotalByTenant(
        tenantId,
        query.startDate,
        query.endDate,
      ),
      this.branchRepo.findAllByTenant(tenantId),
    ]);

    const profit = totalIncome - totalExpense;
    const profitMarginPercent =
      totalIncome > 0 ? Math.round((profit / totalIncome) * 10000) / 100 : 0;

    const tenantSummary: TenantFinancialSummary = {
      tenantId,
      totalIncome,
      totalExpense,
      profit,
      profitMarginPercent,
      startDate: query.startDate ?? null,
      endDate: query.endDate ?? null,
    };

    // Head office financials (branchId = null — consolidated at tenant level minus branch-specific)
    const incomeSummaries = await this.incomeRepo.getConsolidatedReport({
      tenantId,
      startDate: query.startDate,
      endDate: query.endDate,
    });
    const expenseSummaries = await this.expenseRepo.getConsolidatedReport({
      tenantId,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    const headOfficeIncomeSummary = incomeSummaries.find(
      (s) => s.branchId === null,
    );
    const headOfficeExpenseSummary = expenseSummaries.find(
      (s) => s.branchId === null,
    );

    const hoIncome = headOfficeIncomeSummary?.totalAmount ?? 0;
    const hoExpense = headOfficeExpenseSummary?.totalAmount ?? 0;

    const headOffice: HeadOfficeFinancial = {
      income: hoIncome,
      expense: hoExpense,
      profit: hoIncome - hoExpense,
    };

    // Branch breakdown
    const branchBreakdown: BranchFinancialDetail[] = await Promise.all(
      branches
        .filter((b) => b.isActive)
        .map(async (branch) => {
          const [branchIncome, branchExpense] = await Promise.all([
            this.incomeRepo.getTotalByBranch(
              tenantId,
              branch.id,
              query.startDate,
              query.endDate,
            ),
            this.expenseRepo.getTotalByBranch(
              tenantId,
              branch.id,
              query.startDate,
              query.endDate,
            ),
          ]);

          const branchProfit = branchIncome - branchExpense;
          const branchMargin =
            branchIncome > 0
              ? Math.round((branchProfit / branchIncome) * 10000) / 100
              : 0;

          return {
            branchId: branch.id,
            branchName: branch.name,
            income: branchIncome,
            expense: branchExpense,
            profit: branchProfit,
            profitMarginPercent: branchMargin,
          };
        }),
    );

    return {
      tenantSummary,
      headOffice,
      branchBreakdown,
    };
  }

  async getBranchProfitLoss(
    query: FinancialDashboardQueryDto,
  ): Promise<BranchProfitLoss | BranchProfitLoss[]> {
    const tenantId = this.tenantContext.getTenantId();

    if (query.branchId) {
      return this.buildBranchPL(tenantId, query.branchId, query);
    }

    const branches = await this.branchRepo.findAllByTenant(tenantId);
    return Promise.all(
      branches
        .filter((b) => b.isActive)
        .map((branch) =>
          this.buildBranchPL(tenantId, branch.id, query, branch.name),
        ),
    );
  }

  async getConsolidatedBalanceSheet(query: FinancialDashboardQueryDto) {
    const tenantId = this.tenantContext.getTenantId();

    const [incomeSummaries, expenseSummaries, branches] = await Promise.all([
      this.incomeRepo.getConsolidatedReport({
        tenantId,
        startDate: query.startDate,
        endDate: query.endDate,
      }),
      this.expenseRepo.getConsolidatedReport({
        tenantId,
        startDate: query.startDate,
        endDate: query.endDate,
      }),
      this.branchRepo.findAllByTenant(tenantId),
    ]);

    const branchMap = new Map(branches.map((b) => [b.id, b.name]));

    const totalIncome = incomeSummaries.reduce(
      (sum, s) => sum + s.totalAmount,
      0,
    );
    const totalExpense = expenseSummaries.reduce(
      (sum, s) => sum + s.totalAmount,
      0,
    );

    const incomeByBranch = new Map(
      incomeSummaries.map((s) => [s.branchId, s.totalAmount]),
    );
    const expenseByBranch = new Map(
      expenseSummaries.map((s) => [s.branchId, s.totalAmount]),
    );

    // Gather all unique branchIds
    const allBranchIds = new Set([
      ...incomeByBranch.keys(),
      ...expenseByBranch.keys(),
    ]);

    const entries = Array.from(allBranchIds).map((branchId) => {
      const income = incomeByBranch.get(branchId) ?? 0;
      const expense = expenseByBranch.get(branchId) ?? 0;
      return {
        branchId,
        branchName: branchId
          ? (branchMap.get(branchId) ?? 'Unknown')
          : 'Head Office',
        income,
        expense,
        netPosition: income - expense,
      };
    });

    return {
      tenantId,
      startDate: query.startDate ?? null,
      endDate: query.endDate ?? null,
      totalIncome,
      totalExpense,
      netPosition: totalIncome - totalExpense,
      entries,
    };
  }

  async getCashFlowByBranch(query: FinancialDashboardQueryDto) {
    const tenantId = this.tenantContext.getTenantId();

    if (query.branchId) {
      const incomeRecords = await this.incomeRepo.findByDateRange({
        tenantId,
        branchId: query.branchId,
        startDate: query.startDate,
        endDate: query.endDate,
      });
      const expenseRecords = await this.expenseRepo.findByDateRange({
        tenantId,
        branchId: query.branchId,
        startDate: query.startDate,
        endDate: query.endDate,
      });

      return {
        branchId: query.branchId,
        cashFlow: this.buildCashFlow(incomeRecords, expenseRecords),
      };
    }

    // All branches
    const branches = await this.branchRepo.findAllByTenant(tenantId);
    const result = await Promise.all(
      branches
        .filter((b) => b.isActive)
        .map(async (branch) => {
          const [incomeRecs, expenseRecs] = await Promise.all([
            this.incomeRepo.findByDateRange({
              tenantId,
              branchId: branch.id,
              startDate: query.startDate,
              endDate: query.endDate,
            }),
            this.expenseRepo.findByDateRange({
              tenantId,
              branchId: branch.id,
              startDate: query.startDate,
              endDate: query.endDate,
            }),
          ]);
          return {
            branchId: branch.id,
            branchName: branch.name,
            cashFlow: this.buildCashFlow(incomeRecs, expenseRecs),
          };
        }),
    );

    return result;
  }

  // ─── Private helpers ──────────────────────────────────

  private async buildBranchPL(
    tenantId: string,
    branchId: string,
    query: FinancialDashboardQueryDto,
    branchName?: string,
  ): Promise<BranchProfitLoss> {
    const branch = branchName
      ? { name: branchName }
      : await this.branchRepo.findById(branchId);

    const [incomeRecords, expenseRecords] = await Promise.all([
      this.incomeRepo.findByDateRange({
        tenantId,
        branchId,
        startDate: query.startDate,
        endDate: query.endDate,
      }),
      this.expenseRepo.findByDateRange({
        tenantId,
        branchId,
        startDate: query.startDate,
        endDate: query.endDate,
      }),
    ]);

    const totalIncome = incomeRecords.reduce(
      (sum, r) => sum + Number(r.amount),
      0,
    );
    const totalExpense = expenseRecords.reduce(
      (sum, r) => sum + Number(r.amount),
      0,
    );

    return {
      branchId,
      branchName: branch?.name ?? 'Unknown',
      cashFlow: this.buildCashFlow(incomeRecords, expenseRecords),
      totalIncome,
      totalExpense,
      profit: totalIncome - totalExpense,
    };
  }

  private buildCashFlow(
    incomeRecords: Array<{ date: Date; amount: number }>,
    expenseRecords: Array<{ date: Date; amount: number }>,
  ): CashFlowEntry[] {
    const monthMap = new Map<string, { income: number; expense: number }>();

    for (const rec of incomeRecords) {
      const period = this.toPeriod(rec.date);
      const entry = monthMap.get(period) ?? { income: 0, expense: 0 };
      entry.income += Number(rec.amount);
      monthMap.set(period, entry);
    }

    for (const rec of expenseRecords) {
      const period = this.toPeriod(rec.date);
      const entry = monthMap.get(period) ?? { income: 0, expense: 0 };
      entry.expense += Number(rec.amount);
      monthMap.set(period, entry);
    }

    const sorted = Array.from(monthMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return sorted.map(([period, data]) => ({
      period,
      income: data.income,
      expense: data.expense,
      netCashFlow: data.income - data.expense,
    }));
  }

  private toPeriod(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
