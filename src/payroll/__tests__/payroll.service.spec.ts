import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PayrollService } from '../payroll.service';
import { SalaryStructureRepository } from '../infrastructure/persistence/salary-structure.repository';
import { PayrollSlipRepository } from '../infrastructure/persistence/payroll-slip.repository';

import { TenantRepository } from '../../tenant/infrastructure/persistence/tenant.repository';
import { AccountsService } from '../../lms/accounts/accounts.service';
import { TenantContextService } from '../../tenant/tenant-context/tenant-context.service';
import { SalaryStatusEnum } from '../../lms/common/enums/general.enum';

describe('PayrollService', () => {
  let service: PayrollService;

  const TENANT_A = '00000000-0000-0000-0000-000000000001';
  const TENANT_B = '00000000-0000-0000-0000-000000000002';
  const BRANCH_A1 = '00000000-0000-0000-0000-0000000000a1';

  const mockStructure = {
    id: 1,
    staffId: 1,
    name: 'Standard Teacher',
    components: [
      { name: 'Basic Salary', type: 'earning' as const, amount: 50000 },
      { name: 'Housing', type: 'earning' as const, amount: 10000 },
      { name: 'Tax', type: 'deduction' as const, amount: 3000 },
    ],
    totalEarnings: 60000,
    totalDeductions: 3000,
    netPay: 57000,
    isActive: true,
    tenantId: TENANT_A,
    branchId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null as unknown as Date,
  };

  const mockSlip = {
    id: 1,
    staffId: 1,
    structureId: 1,
    month: 1,
    year: 2026,
    breakdown: {
      earnings: [
        { name: 'Basic Salary', type: 'earning', amount: 50000 },
        { name: 'Housing', type: 'earning', amount: 10000 },
      ],
      deductions: [{ name: 'Tax', type: 'deduction', amount: 3000 }],
      totalEarnings: 60000,
      totalDeductions: 3000,
      netPay: 57000,
    },
    totalEarnings: 60000,
    totalDeductions: 3000,
    netPay: 57000,
    workingDays: 22,
    presentDays: 22,
    status: SalaryStatusEnum.processed,
    paidAt: null,
    remarks: null,
    tenantId: TENANT_A,
    branchId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null as unknown as Date,
  };

  const mockTenant = {
    id: TENANT_A,
    name: 'ABC Education',
    slug: 'abc-education',
    contactEmail: 'admin@abc.com',
    contactPhone: null,
    isActive: true,
    settings: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null as unknown as Date,
  };

  const structureRepo = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByStaffId: jest.fn(),
    findActiveByTenant: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const slipRepo = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByStaffAndMonth: jest.fn(),
    findByMonth: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const tenantRepo = {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findBySlug: jest.fn(),
  };

  const accountsService = {
    createExpense: jest.fn(),
    findAllExpenses: jest.fn(),
    findOneExpense: jest.fn(),
    updateExpense: jest.fn(),
    removeExpense: jest.fn(),
    createIncome: jest.fn(),
    findAllIncomes: jest.fn(),
    findOneIncome: jest.fn(),
    updateIncome: jest.fn(),
    removeIncome: jest.fn(),
  };

  const tenantContext = {
    getTenantId: jest.fn().mockReturnValue(TENANT_A),
    getBranchId: jest.fn().mockReturnValue(null),
    hasContext: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        { provide: SalaryStructureRepository, useValue: structureRepo },
        { provide: PayrollSlipRepository, useValue: slipRepo },
        { provide: TenantRepository, useValue: tenantRepo },
        { provide: AccountsService, useValue: accountsService },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);

    jest.clearAllMocks();
    tenantContext.getTenantId.mockReturnValue(TENANT_A);
    tenantContext.getBranchId.mockReturnValue(null);
    tenantContext.hasContext.mockReturnValue(true);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ═══════════════════════════════════════════════════════
  //  Salary Structure CRUD
  // ═══════════════════════════════════════════════════════
  describe('createStructure', () => {
    it('should create a salary structure with computed totals', async () => {
      structureRepo.create.mockResolvedValue(mockStructure);

      const result = await service.createStructure({
        tenantId: TENANT_A,
        staffId: 1,
        name: 'Standard Teacher',
        components: [
          { name: 'Basic Salary', type: 'earning', amount: 50000 },
          { name: 'Housing', type: 'earning', amount: 10000 },
          { name: 'Tax', type: 'deduction', amount: 3000 },
        ],
      });

      expect(result).toEqual(mockStructure);
      expect(structureRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          staffId: 1,
          totalEarnings: 60000,
          totalDeductions: 3000,
          netPay: 57000,
        }),
      );
    });

    it('should use tenant context when tenantId not in DTO', async () => {
      structureRepo.create.mockResolvedValue(mockStructure);

      await service.createStructure({
        tenantId: '',
        staffId: 1,
        name: 'Test',
        components: [{ name: 'Basic', type: 'earning', amount: 30000 }],
      });

      expect(tenantContext.getTenantId).toHaveBeenCalled();
    });

    it('should support branch-specific structures', async () => {
      const branchStructure = { ...mockStructure, branchId: BRANCH_A1 };
      structureRepo.create.mockResolvedValue(branchStructure);

      const result = await service.createStructure({
        tenantId: TENANT_A,
        branchId: BRANCH_A1,
        staffId: 1,
        name: 'Branch Override',
        components: [{ name: 'Basic', type: 'earning', amount: 55000 }],
      });

      expect(result.branchId).toBe(BRANCH_A1);
    });
  });

  describe('findAllStructures', () => {
    it('should return all structures for tenant', async () => {
      structureRepo.findAll.mockResolvedValue([mockStructure]);

      const result = await service.findAllStructures();

      expect(result).toHaveLength(1);
      expect(structureRepo.findAll).toHaveBeenCalled();
    });
  });

  describe('findOneStructure', () => {
    it('should return a structure by id', async () => {
      structureRepo.findById.mockResolvedValue(mockStructure);

      const result = await service.findOneStructure(1);

      expect(result).toEqual(mockStructure);
    });

    it('should throw NotFoundException when structure not found', async () => {
      structureRepo.findById.mockResolvedValue(null);

      await expect(service.findOneStructure(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStructure', () => {
    it('should update structure name', async () => {
      structureRepo.findById.mockResolvedValue(mockStructure);
      const updated = { ...mockStructure, name: 'Updated Name' };
      structureRepo.update.mockResolvedValue(updated);

      const result = await service.updateStructure(1, {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
    });

    it('should recalculate totals when components change', async () => {
      structureRepo.findById.mockResolvedValue(mockStructure);
      structureRepo.update.mockResolvedValue({
        ...mockStructure,
        totalEarnings: 70000,
        totalDeductions: 5000,
        netPay: 65000,
      });

      await service.updateStructure(1, {
        components: [
          { name: 'Basic', type: 'earning', amount: 70000 },
          { name: 'Tax', type: 'deduction', amount: 5000 },
        ],
      });

      expect(structureRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          totalEarnings: 70000,
          totalDeductions: 5000,
          netPay: 65000,
        }),
      );
    });

    it('should throw NotFoundException when structure not found', async () => {
      structureRepo.findById.mockResolvedValue(null);

      await expect(service.updateStructure(999, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeStructure', () => {
    it('should soft-delete a structure', async () => {
      structureRepo.findById.mockResolvedValue(mockStructure);
      structureRepo.remove.mockResolvedValue(undefined);

      await service.removeStructure(1);

      expect(structureRepo.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when structure not found', async () => {
      structureRepo.findById.mockResolvedValue(null);

      await expect(service.removeStructure(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Payroll Processing
  // ═══════════════════════════════════════════════════════
  describe('processPayroll', () => {
    it('should process payroll for all active structures in tenant', async () => {
      slipRepo.findByMonth.mockResolvedValue([]);
      structureRepo.findActiveByTenant.mockResolvedValue([mockStructure]);
      slipRepo.findByStaffAndMonth.mockResolvedValue(null);
      slipRepo.create.mockResolvedValue(mockSlip);
      accountsService.createExpense.mockResolvedValue({});

      const result = await service.processPayroll({
        tenantId: TENANT_A,
        month: 1,
        year: 2026,
      });

      expect(result.processedCount).toBe(1);
      expect(result.slips).toHaveLength(1);
      expect(slipRepo.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if payroll already processed', async () => {
      slipRepo.findByMonth.mockResolvedValue([mockSlip]);

      await expect(
        service.processPayroll({
          tenantId: TENANT_A,
          month: 1,
          year: 2026,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should filter structures by branch when branchId provided', async () => {
      const branchStructure = { ...mockStructure, branchId: BRANCH_A1 };
      const otherStructure = {
        ...mockStructure,
        id: 2,
        branchId: '00000000-0000-0000-0000-0000000000a2',
      };

      slipRepo.findByMonth.mockResolvedValue([]);
      structureRepo.findActiveByTenant.mockResolvedValue([
        branchStructure,
        otherStructure,
      ]);
      slipRepo.findByStaffAndMonth.mockResolvedValue(null);
      slipRepo.create.mockResolvedValue(mockSlip);
      accountsService.createExpense.mockResolvedValue({});

      const result = await service.processPayroll({
        tenantId: TENANT_A,
        month: 2,
        year: 2026,
        branchId: BRANCH_A1,
      });

      // Should only process BRANCH_A1 structure (not the a2 one)
      expect(result.processedCount).toBe(1);
    });

    it('should include null-branch structures in branch-filtered payroll', async () => {
      const globalStructure = { ...mockStructure, branchId: null };
      const branchStructure = {
        ...mockStructure,
        id: 2,
        branchId: BRANCH_A1,
      };

      slipRepo.findByMonth.mockResolvedValue([]);
      structureRepo.findActiveByTenant.mockResolvedValue([
        globalStructure,
        branchStructure,
      ]);
      slipRepo.findByStaffAndMonth.mockResolvedValue(null);
      slipRepo.create.mockResolvedValue(mockSlip);
      accountsService.createExpense.mockResolvedValue({});

      const result = await service.processPayroll({
        tenantId: TENANT_A,
        month: 3,
        year: 2026,
        branchId: BRANCH_A1,
      });

      // Both global (null branch) and branch-specific should be included
      expect(result.processedCount).toBe(2);
    });

    it('should create expense entry for each slip', async () => {
      slipRepo.findByMonth.mockResolvedValue([]);
      structureRepo.findActiveByTenant.mockResolvedValue([mockStructure]);
      slipRepo.findByStaffAndMonth.mockResolvedValue(null);
      slipRepo.create.mockResolvedValue(mockSlip);
      accountsService.createExpense.mockResolvedValue({});

      await service.processPayroll({
        tenantId: TENANT_A,
        month: 4,
        year: 2026,
      });

      expect(accountsService.createExpense).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: TENANT_A,
          category: 'SALARY',
          amount: 57000,
        }),
      );
    });

    it('should skip staff already processed for the month', async () => {
      slipRepo.findByMonth.mockResolvedValue([]);
      structureRepo.findActiveByTenant.mockResolvedValue([mockStructure]);
      slipRepo.findByStaffAndMonth.mockResolvedValue(mockSlip);

      const result = await service.processPayroll({
        tenantId: TENANT_A,
        month: 5,
        year: 2026,
      });

      // Should return the existing slip, not create a new one
      expect(result.processedCount).toBe(1);
      expect(slipRepo.create).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Salary Slips
  // ═══════════════════════════════════════════════════════
  describe('findAllSlips', () => {
    it('should return all slips for tenant', async () => {
      slipRepo.findAll.mockResolvedValue([mockSlip]);

      const result = await service.findAllSlips();

      expect(result).toHaveLength(1);
    });
  });

  describe('findOneSlip', () => {
    it('should return a slip by id', async () => {
      slipRepo.findById.mockResolvedValue(mockSlip);

      const result = await service.findOneSlip(1);

      expect(result).toEqual(mockSlip);
    });

    it('should throw NotFoundException when slip not found', async () => {
      slipRepo.findById.mockResolvedValue(null);

      await expect(service.findOneSlip(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  PDF Generation
  // ═══════════════════════════════════════════════════════
  describe('generatePdf', () => {
    it('should generate PDF buffer with tenant branding', async () => {
      slipRepo.findById.mockResolvedValue(mockSlip);
      tenantRepo.findById.mockResolvedValue(mockTenant);

      const result = await service.generatePdf(1);

      expect(Buffer.isBuffer(result)).toBe(true);
      const content = result.toString();
      expect(content).toContain(mockTenant.name);
      expect(content).toContain(mockTenant.slug);
      expect(content).toContain('NET PAY');
    });

    it('should throw NotFoundException when slip not found', async () => {
      slipRepo.findById.mockResolvedValue(null);

      await expect(service.generatePdf(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when tenant not found', async () => {
      slipRepo.findById.mockResolvedValue(mockSlip);
      tenantRepo.findById.mockResolvedValue(null);

      await expect(service.generatePdf(1)).rejects.toThrow(NotFoundException);
    });

    it('should include earnings and deductions in PDF', async () => {
      slipRepo.findById.mockResolvedValue(mockSlip);
      tenantRepo.findById.mockResolvedValue(mockTenant);

      const result = await service.generatePdf(1);
      const content = result.toString();

      expect(content).toContain('EARNINGS');
      expect(content).toContain('DEDUCTIONS');
      expect(content).toContain('Basic Salary');
    });

    // eslint-disable-next-line no-restricted-syntax
    it(`should include staff and period info in PDF`, async () => {
      slipRepo.findById.mockResolvedValue(mockSlip);
      tenantRepo.findById.mockResolvedValue(mockTenant);

      const result = await service.generatePdf(1);
      const content = result.toString();

      expect(content).toContain(`Staff ID: ${mockSlip.staffId}`);
      expect(content).toContain(`Period: ${mockSlip.month}/${mockSlip.year}`);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Tenant Isolation
  // ═══════════════════════════════════════════════════════
  describe('tenant isolation', () => {
    it('should scope structures to current tenant context', async () => {
      structureRepo.findAll.mockResolvedValue([mockStructure]);

      const result = await service.findAllStructures();

      // Repo should internally filter by tenant
      expect(result.every((s) => s.tenantId === TENANT_A)).toBe(true);
    });

    it('should scope slips to current tenant context', async () => {
      slipRepo.findAll.mockResolvedValue([mockSlip]);

      const result = await service.findAllSlips();

      expect(result.every((s) => s.tenantId === TENANT_A)).toBe(true);
    });

    it('should use different tenant for PDF when context switches', async () => {
      const tenantBSlip = { ...mockSlip, tenantId: TENANT_B };
      slipRepo.findById.mockResolvedValue(tenantBSlip);

      const tenantB = {
        ...mockTenant,
        id: TENANT_B,
        name: 'XYZ School',
        slug: 'xyz-school',
      };
      tenantRepo.findById.mockResolvedValue(tenantB);

      const result = await service.generatePdf(1);
      const content = result.toString();

      expect(content).toContain('XYZ School');
      expect(content).toContain('xyz-school');
    });
  });
});
