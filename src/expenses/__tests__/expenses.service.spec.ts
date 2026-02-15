import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExpensesService } from '../expenses.service';
import { BranchExpenseRepository } from '../infrastructure/persistence/branch-expense.repository';
import { TenantContextService } from '../../tenant/tenant-context/tenant-context.service';
import { ExpenseStatusEnum } from '../../lms/common/enums/general.enum';

function createMockRepo() {
  return {
    create: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByDateRange: jest.fn().mockResolvedValue([]),
    getConsolidatedReport: jest.fn().mockResolvedValue([]),
    getTotalByTenant: jest.fn().mockResolvedValue(0),
    getTotalByBranch: jest.fn().mockResolvedValue(0),
  };
}

function createMockTenantContext() {
  return {
    getTenantId: jest.fn().mockReturnValue('tenant-uuid-1'),
    getBranchId: jest.fn().mockReturnValue('branch-uuid-1'),
    hasContext: jest.fn().mockReturnValue(true),
  };
}

describe('ExpensesService', () => {
  let service: ExpensesService;
  let repo: ReturnType<typeof createMockRepo>;
  let tenantContext: ReturnType<typeof createMockTenantContext>;

  const mockExpense = {
    id: 'expense-uuid-1',
    category: 'Utilities',
    description: 'Electricity bill',
    amount: 25000,
    date: new Date('2025-01-20'),
    referenceNumber: 'REF-EXP-001',
    paidTo: 'WAPDA',
    status: ExpenseStatusEnum.pending,
    remarks: 'Monthly bill',
    tenantId: 'tenant-uuid-1',
    branchId: 'branch-uuid-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null as any,
  };

  beforeEach(async () => {
    repo = createMockRepo();
    tenantContext = createMockTenantContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: BranchExpenseRepository, useValue: repo },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Create ───────────────────────────────────────────

  describe('create', () => {
    it('should create an expense record', async () => {
      repo.create.mockResolvedValue(mockExpense);

      const result = await service.create({
        tenantId: 'tenant-uuid-1',
        branchId: 'branch-uuid-1',
        category: 'Utilities',
        amount: 25000,
        date: '2025-01-20',
        description: 'Electricity bill',
        referenceNumber: 'REF-EXP-001',
        paidTo: 'WAPDA',
        status: ExpenseStatusEnum.pending,
        remarks: 'Monthly bill',
      });

      expect(result).toEqual(mockExpense);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Utilities',
          amount: 25000,
        }),
      );
    });

    it('should create head-office expense with null branchId', async () => {
      const headOfficeExpense = { ...mockExpense, branchId: null };
      repo.create.mockResolvedValue(headOfficeExpense);

      const result = await service.create({
        tenantId: 'tenant-uuid-1',
        category: 'Office Supplies',
        amount: 5000,
        date: '2025-01-20',
      });

      expect(result.branchId).toBeNull();
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          branchId: null,
        }),
      );
    });

    it('should default status to pending when not provided', async () => {
      repo.create.mockResolvedValue(mockExpense);

      await service.create({
        tenantId: 'tenant-uuid-1',
        category: 'Utilities',
        amount: 25000,
        date: '2025-01-20',
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ExpenseStatusEnum.pending,
        }),
      );
    });
  });

  // ─── Find All ─────────────────────────────────────────

  describe('findAll', () => {
    it('should return all expense records', async () => {
      repo.findAll.mockResolvedValue([mockExpense]);

      const result = await service.findAll();

      expect(result).toEqual([mockExpense]);
      expect(repo.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no records exist', async () => {
      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ─── Find By ID ───────────────────────────────────────

  describe('findById', () => {
    it('should return expense by id', async () => {
      repo.findById.mockResolvedValue(mockExpense);

      const result = await service.findById('expense-uuid-1');

      expect(result).toEqual(mockExpense);
    });

    it('should throw NotFoundException when expense not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── Update ───────────────────────────────────────────

  describe('update', () => {
    it('should update an expense record', async () => {
      const updated = { ...mockExpense, amount: 30000 };
      repo.findById.mockResolvedValue(mockExpense);
      repo.update.mockResolvedValue(updated);

      const result = await service.update('expense-uuid-1', {
        amount: 30000,
      });

      expect(result.amount).toBe(30000);
    });

    it('should throw NotFoundException when updating nonexistent record', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { amount: 30000 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update status field', async () => {
      const approved = {
        ...mockExpense,
        status: ExpenseStatusEnum.approved,
      };
      repo.findById.mockResolvedValue(mockExpense);
      repo.update.mockResolvedValue(approved);

      const result = await service.update('expense-uuid-1', {
        status: ExpenseStatusEnum.approved,
      });

      expect(result.status).toBe(ExpenseStatusEnum.approved);
    });
  });

  // ─── Remove ───────────────────────────────────────────

  describe('remove', () => {
    it('should remove an expense record', async () => {
      repo.findById.mockResolvedValue(mockExpense);
      repo.remove.mockResolvedValue(undefined);

      await service.remove('expense-uuid-1');

      expect(repo.remove).toHaveBeenCalledWith('expense-uuid-1');
    });

    it('should throw NotFoundException when removing nonexistent record', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── Reports ──────────────────────────────────────────

  describe('getExpenseReport', () => {
    it('should return expense report with date range', async () => {
      repo.findByDateRange.mockResolvedValue([mockExpense]);

      const result = await service.getExpenseReport({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      expect(result).toEqual([mockExpense]);
      expect(repo.findByDateRange).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-uuid-1',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        }),
      );
    });

    it('should filter by category', async () => {
      repo.findByDateRange.mockResolvedValue([mockExpense]);

      await service.getExpenseReport({ category: 'Utilities' });

      expect(repo.findByDateRange).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Utilities',
        }),
      );
    });
  });

  describe('getConsolidatedReport', () => {
    it('should return consolidated report with grand total', async () => {
      repo.getConsolidatedReport.mockResolvedValue([
        { branchId: 'branch-uuid-1', totalAmount: 50000, count: 3 },
        { branchId: null, totalAmount: 20000, count: 2 },
      ]);

      const result = await service.getConsolidatedReport({});

      expect(result.grandTotal).toBe(70000);
      expect(result.totalCount).toBe(5);
      expect(result.branches).toHaveLength(2);
    });

    it('should return zero totals with no data', async () => {
      const result = await service.getConsolidatedReport({});

      expect(result.grandTotal).toBe(0);
      expect(result.totalCount).toBe(0);
    });
  });
});
