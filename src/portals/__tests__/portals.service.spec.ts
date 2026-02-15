import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PortalsService } from '../portals.service';
import { TenantContextService } from '../../tenant/tenant-context/tenant-context.service';
import { TenantRepository } from '../../tenant/infrastructure/persistence/tenant.repository';
import { BranchRepository } from '../../tenant/infrastructure/persistence/branch.repository';
import { StaffBranchAssignmentRepository } from '../../staff-management/infrastructure/persistence/staff-branch-assignment.repository';

function createMockTenantContext() {
  return {
    getTenantId: jest.fn().mockReturnValue('tenant-uuid-1'),
    getBranchId: jest.fn().mockReturnValue('branch-uuid-1'),
    hasContext: jest.fn().mockReturnValue(true),
  };
}

function createMockTenantRepo() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

function createMockBranchRepo() {
  return {
    create: jest.fn(),
    findAllByTenant: jest.fn(),
    findByTenantAndCode: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

function createMockStaffBranchRepo() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByStaffId: jest.fn(),
    findByStaffAndBranch: jest.fn(),
    updatePrimaryFlag: jest.fn(),
    findByUserAndTenant: jest.fn().mockResolvedValue([]),
  };
}

describe('PortalsService', () => {
  let service: PortalsService;
  let tenantContext: ReturnType<typeof createMockTenantContext>;
  let tenantRepo: ReturnType<typeof createMockTenantRepo>;
  let branchRepo: ReturnType<typeof createMockBranchRepo>;
  let staffBranchRepo: ReturnType<typeof createMockStaffBranchRepo>;

  const mockTenant = {
    id: 'tenant-uuid-1',
    name: 'Test School',
    slug: 'test-school',
    isActive: true,
    settings: { logoUrl: 'https://example.com/logo.png' },
  };

  const mockBranch = {
    id: 'branch-uuid-1',
    name: 'Main Campus',
    code: 'MC',
    isActive: true,
  };

  beforeEach(async () => {
    tenantContext = createMockTenantContext();
    tenantRepo = createMockTenantRepo();
    branchRepo = createMockBranchRepo();
    staffBranchRepo = createMockStaffBranchRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortalsService,
        { provide: TenantContextService, useValue: tenantContext },
        { provide: TenantRepository, useValue: tenantRepo },
        { provide: BranchRepository, useValue: branchRepo },
        {
          provide: StaffBranchAssignmentRepository,
          useValue: staffBranchRepo,
        },
      ],
    }).compile();

    service = module.get<PortalsService>(PortalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Student Dashboard ────────────────────────────────

  describe('getStudentDashboard', () => {
    it('should return student dashboard scoped to tenant', async () => {
      tenantRepo.findById.mockResolvedValue(mockTenant);
      branchRepo.findById.mockResolvedValue(mockBranch);

      const result = await service.getStudentDashboard(1);

      expect(result.tenant.name).toBe('Test School');
      expect(result.branch).toBe('Main Campus');
      expect(result).toHaveProperty('attendance');
      expect(result).toHaveProperty('fees');
      expect(result).toHaveProperty('exams');
    });

    it('should include tenant branding info', async () => {
      tenantRepo.findById.mockResolvedValue(mockTenant);
      branchRepo.findById.mockResolvedValue(mockBranch);

      const result = await service.getStudentDashboard(1);

      expect(result.tenant.logoUrl).toBe('https://example.com/logo.png');
    });

    it('should throw NotFoundException if tenant not found', async () => {
      tenantRepo.findById.mockResolvedValue(null);

      await expect(service.getStudentDashboard(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should filter by specific branch when provided', async () => {
      tenantRepo.findById.mockResolvedValue(mockTenant);
      branchRepo.findById.mockResolvedValue({
        ...mockBranch,
        id: 'branch-uuid-2',
        name: 'South Campus',
      });

      const result = await service.getStudentDashboard(1, 'branch-uuid-2');
      expect(result.branch).toBe('South Campus');
    });
  });

  // ─── Staff Dashboard ──────────────────────────────────

  describe('getStaffDashboard', () => {
    it('should return staff dashboard with all branch assignments', async () => {
      tenantRepo.findById.mockResolvedValue(mockTenant);
      staffBranchRepo.findByUserAndTenant.mockResolvedValue([
        { branchId: 'branch-uuid-1', isPrimary: true },
        { branchId: 'branch-uuid-2', isPrimary: false },
      ]);
      branchRepo.findById
        .mockResolvedValueOnce(mockBranch)
        .mockResolvedValueOnce({
          id: 'branch-uuid-2',
          name: 'South Campus',
        });

      const result = await service.getStaffDashboard(1);

      expect(result.tenant.name).toBe('Test School');
      expect(result.allBranches).toHaveLength(2);
      expect(result.primaryBranch).toBeTruthy();
      expect(result.primaryBranch?.name).toBe('Main Campus');
    });

    it('should aggregate data from all assigned branches', async () => {
      tenantRepo.findById.mockResolvedValue(mockTenant);
      staffBranchRepo.findByUserAndTenant.mockResolvedValue([
        { branchId: 'branch-uuid-1', isPrimary: true },
      ]);
      branchRepo.findById.mockResolvedValue(mockBranch);

      const result = await service.getStaffDashboard(1);

      expect(result).toHaveProperty('totalAssignedClasses');
      expect(result).toHaveProperty('attendance');
    });

    it('should filter by specific branch when branchId provided', async () => {
      tenantRepo.findById.mockResolvedValue(mockTenant);
      staffBranchRepo.findByUserAndTenant.mockResolvedValue([
        { branchId: 'branch-uuid-1', isPrimary: true },
        { branchId: 'branch-uuid-2', isPrimary: false },
      ]);
      branchRepo.findById.mockResolvedValue(mockBranch);

      const result = await service.getStaffDashboard(1, 'branch-uuid-1');

      expect(result.allBranches).toHaveLength(1);
    });
  });

  // ─── Switch Branch ────────────────────────────────────

  describe('switchBranch', () => {
    it('should switch branch context successfully', async () => {
      branchRepo.findById.mockResolvedValue(mockBranch);
      staffBranchRepo.findByUserAndTenant.mockResolvedValue([
        { branchId: 'branch-uuid-1', isPrimary: true },
      ]);

      const result = await service.switchBranch(
        1,
        'tenant-uuid-1',
        'branch-uuid-1',
      );

      expect(result.branchId).toBe('branch-uuid-1');
      expect(result.branchName).toBe('Main Campus');
    });

    it('should throw NotFoundException if branch not found', async () => {
      branchRepo.findById.mockResolvedValue(null);

      await expect(
        service.switchBranch(1, 'tenant-uuid-1', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user has no access to branch', async () => {
      branchRepo.findById.mockResolvedValue(mockBranch);
      staffBranchRepo.findByUserAndTenant.mockResolvedValue([
        { branchId: 'other-branch-uuid', isPrimary: true },
      ]);

      await expect(
        service.switchBranch(1, 'tenant-uuid-1', 'branch-uuid-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow multi-branch user to switch between assigned branches', async () => {
      const branch2 = {
        id: 'branch-uuid-2',
        name: 'South Campus',
        code: 'SC',
      };
      branchRepo.findById.mockResolvedValue(branch2);
      staffBranchRepo.findByUserAndTenant.mockResolvedValue([
        { branchId: 'branch-uuid-1', isPrimary: true },
        { branchId: 'branch-uuid-2', isPrimary: false },
      ]);

      const result = await service.switchBranch(
        1,
        'tenant-uuid-1',
        'branch-uuid-2',
      );

      expect(result.branchId).toBe('branch-uuid-2');
      expect(result.branchName).toBe('South Campus');
    });
  });
});
