import { Test, TestingModule } from '@nestjs/testing';
import { FinancialDashboardService } from '../financial-dashboard.service';
import { BranchIncomeRepository } from '../../income/infrastructure/persistence/branch-income.repository';
import { BranchExpenseRepository } from '../../expenses/infrastructure/persistence/branch-expense.repository';
import { BranchRepository } from '../../tenant/infrastructure/persistence/branch.repository';
import { TenantContextService } from '../../tenant/tenant-context/tenant-context.service';
import { CashFlowEntry } from '../domain/financial-dashboard';

function createMockIncomeRepo() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByDateRange: jest.fn().mockResolvedValue([]),
    getConsolidatedReport: jest.fn().mockResolvedValue([]),
    getTotalByTenant: jest.fn().mockResolvedValue(0),
    getTotalByBranch: jest.fn().mockResolvedValue(0),
  };
}

function createMockExpenseRepo() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByDateRange: jest.fn().mockResolvedValue([]),
    getConsolidatedReport: jest.fn().mockResolvedValue([]),
    getTotalByTenant: jest.fn().mockResolvedValue(0),
    getTotalByBranch: jest.fn().mockResolvedValue(0),
  };
}

function createMockBranchRepo() {
  return {
    create: jest.fn(),
    findAllByTenant: jest.fn().mockResolvedValue([]),
    findByTenantAndCode: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

function createMockTenantContext() {
  return {
    getTenantId: jest.fn().mockReturnValue('tenant-uuid-1'),
    getBranchId: jest.fn().mockReturnValue(null),
    hasContext: jest.fn().mockReturnValue(true),
  };
}

const mockBranches = [
  {
    id: 'branch-uuid-1',
    tenantId: 'tenant-uuid-1',
    name: 'Main Campus',
    code: 'MAIN',
    isActive: true,
    isHeadquarters: true,
  },
  {
    id: 'branch-uuid-2',
    tenantId: 'tenant-uuid-1',
    name: 'City Campus',
    code: 'CITY',
    isActive: true,
    isHeadquarters: false,
  },
  {
    id: 'branch-uuid-3',
    tenantId: 'tenant-uuid-1',
    name: 'Closed Campus',
    code: 'CLO',
    isActive: false,
    isHeadquarters: false,
  },
];

describe('FinancialDashboardService', () => {
  let service: FinancialDashboardService;
  let incomeRepo: ReturnType<typeof createMockIncomeRepo>;
  let expenseRepo: ReturnType<typeof createMockExpenseRepo>;
  let branchRepo: ReturnType<typeof createMockBranchRepo>;
  let tenantContext: ReturnType<typeof createMockTenantContext>;

  beforeEach(async () => {
    incomeRepo = createMockIncomeRepo();
    expenseRepo = createMockExpenseRepo();
    branchRepo = createMockBranchRepo();
    tenantContext = createMockTenantContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialDashboardService,
        { provide: BranchIncomeRepository, useValue: incomeRepo },
        { provide: BranchExpenseRepository, useValue: expenseRepo },
        { provide: BranchRepository, useValue: branchRepo },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<FinancialDashboardService>(FinancialDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Financial Dashboard ──────────────────────────────

  describe('getFinancialDashboard', () => {
    it('should return tenant-wide P&L summary', async () => {
      incomeRepo.getTotalByTenant.mockResolvedValue(500000);
      expenseRepo.getTotalByTenant.mockResolvedValue(300000);
      branchRepo.findAllByTenant.mockResolvedValue(mockBranches);
      incomeRepo.getConsolidatedReport.mockResolvedValue([
        { branchId: null, totalAmount: 100000, count: 5 },
        { branchId: 'branch-uuid-1', totalAmount: 200000, count: 10 },
      ]);
      expenseRepo.getConsolidatedReport.mockResolvedValue([
        { branchId: null, totalAmount: 50000, count: 3 },
        { branchId: 'branch-uuid-1', totalAmount: 100000, count: 7 },
      ]);
      incomeRepo.getTotalByBranch.mockResolvedValue(200000);
      expenseRepo.getTotalByBranch.mockResolvedValue(120000);

      const result = await service.getFinancialDashboard({});

      expect(result.tenantSummary.totalIncome).toBe(500000);
      expect(result.tenantSummary.totalExpense).toBe(300000);
      expect(result.tenantSummary.profit).toBe(200000);
      expect(result.tenantSummary.profitMarginPercent).toBe(40);
    });

    it('should calculate head office financials from null branchId', async () => {
      incomeRepo.getTotalByTenant.mockResolvedValue(100000);
      expenseRepo.getTotalByTenant.mockResolvedValue(60000);
      branchRepo.findAllByTenant.mockResolvedValue([]);
      incomeRepo.getConsolidatedReport.mockResolvedValue([
        { branchId: null, totalAmount: 100000, count: 5 },
      ]);
      expenseRepo.getConsolidatedReport.mockResolvedValue([
        { branchId: null, totalAmount: 60000, count: 3 },
      ]);

      const result = await service.getFinancialDashboard({});

      expect(result.headOffice.income).toBe(100000);
      expect(result.headOffice.expense).toBe(60000);
      expect(result.headOffice.profit).toBe(40000);
    });

    it('should filter inactive branches from breakdown', async () => {
      incomeRepo.getTotalByTenant.mockResolvedValue(300000);
      expenseRepo.getTotalByTenant.mockResolvedValue(200000);
      branchRepo.findAllByTenant.mockResolvedValue(mockBranches);
      incomeRepo.getConsolidatedReport.mockResolvedValue([]);
      expenseRepo.getConsolidatedReport.mockResolvedValue([]);
      incomeRepo.getTotalByBranch.mockResolvedValue(100000);
      expenseRepo.getTotalByBranch.mockResolvedValue(80000);

      const result = await service.getFinancialDashboard({});

      // Only 2 active branches (not the isActive=false one)
      expect(result.branchBreakdown).toHaveLength(2);
    });

    it('should handle zero income gracefully (no division by zero)', async () => {
      incomeRepo.getTotalByTenant.mockResolvedValue(0);
      expenseRepo.getTotalByTenant.mockResolvedValue(5000);
      branchRepo.findAllByTenant.mockResolvedValue([]);
      incomeRepo.getConsolidatedReport.mockResolvedValue([]);
      expenseRepo.getConsolidatedReport.mockResolvedValue([]);

      const result = await service.getFinancialDashboard({});

      expect(result.tenantSummary.profitMarginPercent).toBe(0);
      expect(result.tenantSummary.profit).toBe(-5000);
    });

    it('should pass date filters to repositories', async () => {
      incomeRepo.getTotalByTenant.mockResolvedValue(0);
      expenseRepo.getTotalByTenant.mockResolvedValue(0);
      branchRepo.findAllByTenant.mockResolvedValue([]);
      incomeRepo.getConsolidatedReport.mockResolvedValue([]);
      expenseRepo.getConsolidatedReport.mockResolvedValue([]);

      await service.getFinancialDashboard({
        startDate: '2025-01-01',
        endDate: '2025-06-30',
      });

      expect(incomeRepo.getTotalByTenant).toHaveBeenCalledWith(
        'tenant-uuid-1',
        '2025-01-01',
        '2025-06-30',
      );
      expect(expenseRepo.getTotalByTenant).toHaveBeenCalledWith(
        'tenant-uuid-1',
        '2025-01-01',
        '2025-06-30',
      );
    });
  });

  // ─── Branch Profit & Loss ─────────────────────────────

  describe('getBranchProfitLoss', () => {
    it('should return P&L for a specific branch', async () => {
      branchRepo.findById.mockResolvedValue({
        id: 'branch-uuid-1',
        name: 'Main Campus',
      });
      incomeRepo.findByDateRange.mockResolvedValue([
        { date: new Date('2025-01-15'), amount: 50000 },
        { date: new Date('2025-02-15'), amount: 60000 },
      ]);
      expenseRepo.findByDateRange.mockResolvedValue([
        { date: new Date('2025-01-20'), amount: 30000 },
        { date: new Date('2025-02-20'), amount: 25000 },
      ]);

      const result = await service.getBranchProfitLoss({
        branchId: 'branch-uuid-1',
      });

      // Single branch, not array
      expect(result).not.toBeInstanceOf(Array);
      const pl = result as any;
      expect(pl.branchId).toBe('branch-uuid-1');
      expect(pl.totalIncome).toBe(110000);
      expect(pl.totalExpense).toBe(55000);
      expect(pl.profit).toBe(55000);
      expect(pl.cashFlow).toHaveLength(2);
    });

    it('should return P&L for all branches when no branchId specified', async () => {
      branchRepo.findAllByTenant.mockResolvedValue(mockBranches);
      incomeRepo.findByDateRange.mockResolvedValue([]);
      expenseRepo.findByDateRange.mockResolvedValue([]);

      const result = await service.getBranchProfitLoss({});

      // 2 active branches
      expect(Array.isArray(result)).toBe(true);
      expect((result as any[]).length).toBe(2);
    });
  });

  // ─── Consolidated Balance Sheet ───────────────────────

  describe('getConsolidatedBalanceSheet', () => {
    it('should return consolidated balance sheet', async () => {
      incomeRepo.getConsolidatedReport.mockResolvedValue([
        { branchId: 'branch-uuid-1', totalAmount: 200000, count: 10 },
        { branchId: null, totalAmount: 50000, count: 3 },
      ]);
      expenseRepo.getConsolidatedReport.mockResolvedValue([
        { branchId: 'branch-uuid-1', totalAmount: 120000, count: 8 },
        { branchId: null, totalAmount: 30000, count: 2 },
      ]);
      branchRepo.findAllByTenant.mockResolvedValue(mockBranches);

      const result = await service.getConsolidatedBalanceSheet({});

      expect(result.totalIncome).toBe(250000);
      expect(result.totalExpense).toBe(150000);
      expect(result.netPosition).toBe(100000);
      expect(result.entries).toHaveLength(2);
    });

    it('should label null branchId as Head Office', async () => {
      incomeRepo.getConsolidatedReport.mockResolvedValue([
        { branchId: null, totalAmount: 50000, count: 3 },
      ]);
      expenseRepo.getConsolidatedReport.mockResolvedValue([]);
      branchRepo.findAllByTenant.mockResolvedValue([]);

      const result = await service.getConsolidatedBalanceSheet({});

      const hoEntry = result.entries.find(
        (e: any) => e.branchName === 'Head Office',
      );
      expect(hoEntry).toBeDefined();
      expect(hoEntry!.income).toBe(50000);
    });
  });

  // ─── Cash Flow ────────────────────────────────────────

  describe('getCashFlowByBranch', () => {
    it('should return cash flow for a specific branch', async () => {
      incomeRepo.findByDateRange.mockResolvedValue([
        { date: new Date('2025-01-15'), amount: 50000 },
        { date: new Date('2025-01-25'), amount: 30000 },
        { date: new Date('2025-02-10'), amount: 40000 },
      ]);
      expenseRepo.findByDateRange.mockResolvedValue([
        { date: new Date('2025-01-20'), amount: 20000 },
        { date: new Date('2025-02-15'), amount: 15000 },
      ]);

      const result = (await service.getCashFlowByBranch({
        branchId: 'branch-uuid-1',
      })) as { branchId: string; cashFlow: CashFlowEntry[] };

      expect(result.branchId).toBe('branch-uuid-1');
      expect(result.cashFlow).toHaveLength(2);
      // January: income 80000, expense 20000
      const jan = result.cashFlow.find((c: any) => c.period === '2025-01');
      expect(jan!.income).toBe(80000);
      expect(jan!.expense).toBe(20000);
      expect(jan!.netCashFlow).toBe(60000);
    });

    it('should return cash flow for all branches', async () => {
      branchRepo.findAllByTenant.mockResolvedValue(mockBranches);
      incomeRepo.findByDateRange.mockResolvedValue([]);
      expenseRepo.findByDateRange.mockResolvedValue([]);

      const result = await service.getCashFlowByBranch({});

      expect(Array.isArray(result)).toBe(true);
      expect((result as any[]).length).toBe(2); // 2 active branches
    });

    it('should group cash flow entries by month', async () => {
      incomeRepo.findByDateRange.mockResolvedValue([
        { date: new Date('2025-03-01'), amount: 10000 },
        { date: new Date('2025-03-15'), amount: 20000 },
      ]);
      expenseRepo.findByDateRange.mockResolvedValue([
        { date: new Date('2025-03-10'), amount: 5000 },
      ]);

      const result = (await service.getCashFlowByBranch({
        branchId: 'branch-uuid-1',
      })) as { branchId: string; cashFlow: CashFlowEntry[] };

      expect(result.cashFlow).toHaveLength(1);
      expect(result.cashFlow[0].period).toBe('2025-03');
      expect(result.cashFlow[0].income).toBe(30000);
      expect(result.cashFlow[0].expense).toBe(5000);
      expect(result.cashFlow[0].netCashFlow).toBe(25000);
    });
  });
});
