import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { IncomeService } from '../income.service';
import { BranchIncomeRepository } from '../infrastructure/persistence/branch-income.repository';
import { TenantContextService } from '../../tenant/tenant-context/tenant-context.service';

function createMockRepo() {
  return {
    create: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByDateRange: jest.fn().mockResolvedValue([]),
    getConsolidatedReport: jest.fn().mockResolvedValue([]),
  };
}

function createMockTenantContext() {
  return {
    getTenantId: jest.fn().mockReturnValue('tenant-uuid-1'),
    getBranchId: jest.fn().mockReturnValue('branch-uuid-1'),
    hasContext: jest.fn().mockReturnValue(true),
  };
}

describe('IncomeService', () => {
  let service: IncomeService;
  let repo: ReturnType<typeof createMockRepo>;
  let tenantContext: ReturnType<typeof createMockTenantContext>;

  const mockIncome = {
    id: 'income-uuid-1',
    category: 'Tuition',
    description: 'Monthly tuition',
    amount: 50000,
    date: new Date('2025-01-15'),
    referenceNumber: 'REF-001',
    receivedFrom: 'John Doe',
    remarks: 'First semester',
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
        IncomeService,
        { provide: BranchIncomeRepository, useValue: repo },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<IncomeService>(IncomeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Create ───────────────────────────────────────────

  describe('create', () => {
    it('should create an income record', async () => {
      repo.create.mockResolvedValue(mockIncome);

      const result = await service.create({
        tenantId: 'tenant-uuid-1',
        branchId: 'branch-uuid-1',
        category: 'Tuition',
        amount: 50000,
        date: '2025-01-15',
        description: 'Monthly tuition',
        referenceNumber: 'REF-001',
        receivedFrom: 'John Doe',
        remarks: 'First semester',
      });

      expect(result).toEqual(mockIncome);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Tuition',
          amount: 50000,
        }),
      );
    });

    it('should create tenant-wide income with null branchId', async () => {
      const tenantWideIncome = { ...mockIncome, branchId: null };
      repo.create.mockResolvedValue(tenantWideIncome);

      const result = await service.create({
        tenantId: 'tenant-uuid-1',
        category: 'Donation',
        amount: 100000,
        date: '2025-01-15',
      });

      expect(result.branchId).toBeNull();
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          branchId: null,
        }),
      );
    });
  });

  // ─── Find All ─────────────────────────────────────────

  describe('findAll', () => {
    it('should return all income records', async () => {
      repo.findAll.mockResolvedValue([mockIncome]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(repo.findAll).toHaveBeenCalled();
    });
  });

  // ─── Find By ID ───────────────────────────────────────

  describe('findById', () => {
    it('should return an income record by ID', async () => {
      repo.findById.mockResolvedValue(mockIncome);

      const result = await service.findById('income-uuid-1');

      expect(result.id).toBe('income-uuid-1');
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── Update ───────────────────────────────────────────

  describe('update', () => {
    it('should update an income record', async () => {
      repo.findById.mockResolvedValue(mockIncome);
      repo.update.mockResolvedValue({ ...mockIncome, amount: 60000 });

      const result = await service.update('income-uuid-1', {
        amount: 60000,
      });

      expect(result.amount).toBe(60000);
    });

    it('should throw NotFoundException if record does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { amount: 60000 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── Remove ───────────────────────────────────────────

  describe('remove', () => {
    it('should soft-delete an income record', async () => {
      repo.findById.mockResolvedValue(mockIncome);
      repo.remove.mockResolvedValue(undefined);

      await service.remove('income-uuid-1');

      expect(repo.remove).toHaveBeenCalledWith('income-uuid-1');
    });

    it('should throw NotFoundException if record does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── Income Report ────────────────────────────────────

  describe('getIncomeReport', () => {
    it('should return income report filtered by date range', async () => {
      repo.findByDateRange.mockResolvedValue([mockIncome]);

      const result = await service.getIncomeReport({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      expect(result).toHaveLength(1);
      expect(repo.findByDateRange).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-uuid-1',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        }),
      );
    });

    it('should filter report by branch', async () => {
      repo.findByDateRange.mockResolvedValue([mockIncome]);

      await service.getIncomeReport({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        branchId: 'branch-uuid-1',
      });

      expect(repo.findByDateRange).toHaveBeenCalledWith(
        expect.objectContaining({
          branchId: 'branch-uuid-1',
        }),
      );
    });

    it('should filter report by category', async () => {
      repo.findByDateRange.mockResolvedValue([mockIncome]);

      await service.getIncomeReport({
        category: 'Tuition',
      });

      expect(repo.findByDateRange).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Tuition',
        }),
      );
    });
  });

  // ─── Consolidated Report ──────────────────────────────

  describe('getConsolidatedReport', () => {
    it('should return consolidated report grouped by branch', async () => {
      repo.getConsolidatedReport.mockResolvedValue([
        { branchId: 'branch-uuid-1', totalAmount: 150000, count: 3 },
        { branchId: 'branch-uuid-2', totalAmount: 80000, count: 2 },
      ]);

      const result = await service.getConsolidatedReport({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      expect(result.branches).toHaveLength(2);
      expect(result.grandTotal).toBe(230000);
      expect(result.totalCount).toBe(5);
      expect(result.tenantId).toBe('tenant-uuid-1');
    });

    it('should include tenant-wide income with null branchId', async () => {
      repo.getConsolidatedReport.mockResolvedValue([
        { branchId: null, totalAmount: 50000, count: 1 },
        { branchId: 'branch-uuid-1', totalAmount: 100000, count: 2 },
      ]);

      const result = await service.getConsolidatedReport({});

      expect(result.branches).toHaveLength(2);
      expect(result.branches[0].branchId).toBeNull();
      expect(result.grandTotal).toBe(150000);
    });

    it('should return zero totals when no income exists', async () => {
      repo.getConsolidatedReport.mockResolvedValue([]);

      const result = await service.getConsolidatedReport({});

      expect(result.branches).toHaveLength(0);
      expect(result.grandTotal).toBe(0);
      expect(result.totalCount).toBe(0);
    });
  });
});
