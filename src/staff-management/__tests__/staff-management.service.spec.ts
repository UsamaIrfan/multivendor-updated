import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StaffManagementService } from '../staff-management.service';
import { StaffMgmtRepository } from '../infrastructure/persistence/staff-mgmt.repository';
import { StaffBranchAssignmentRepository } from '../infrastructure/persistence/staff-branch-assignment.repository';
import { TenantContextService } from '../../tenant/tenant-context/tenant-context.service';
import { TenantRepository } from '../../tenant/infrastructure/persistence/tenant.repository';
import { BranchRepository } from '../../tenant/infrastructure/persistence/branch.repository';
import { CreateStaffMgmtDto } from '../dto/create-staff-mgmt.dto';

// ── Mock factories ──
function createMockStaffMgmtRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByIdWithAssignments: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByStaffId: jest.fn(),
    findLastByStaffIdPrefix: jest.fn(),
    findByBranch: jest.fn(),
    findByUserId: jest.fn(),
  };
}

function createMockBranchAssignmentRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByStaffId: jest.fn(),
    findByStaffAndBranch: jest.fn(),
    updatePrimaryFlag: jest.fn(),
    findByUserAndTenant: jest.fn(),
  };
}

function createMockTenantRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

function createMockBranchRepository() {
  return {
    create: jest.fn(),
    findAllByTenant: jest.fn(),
    findByTenantAndCode: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

function createMockTenantContext(
  tenantId: string = 'tenant-a-uuid',
  branchId: string | null = null,
) {
  return {
    getTenantId: jest.fn().mockReturnValue(tenantId),
    getBranchId: jest.fn().mockReturnValue(branchId),
    hasContext: jest.fn().mockReturnValue(true),
    getContext: jest.fn().mockReturnValue({ tenantId, branchId }),
    run: jest.fn(),
  };
}

describe('StaffManagementService', () => {
  let service: StaffManagementService;
  let staffRepo: ReturnType<typeof createMockStaffMgmtRepository>;
  let assignmentRepo: ReturnType<typeof createMockBranchAssignmentRepository>;
  let tenantRepo: ReturnType<typeof createMockTenantRepository>;
  let branchRepo: ReturnType<typeof createMockBranchRepository>;
  let tenantContext: ReturnType<typeof createMockTenantContext>;

  const TENANT_A = 'tenant-a-uuid';
  const TENANT_B = 'tenant-b-uuid';
  const BRANCH_A1 = 'branch-a1-uuid';
  const BRANCH_A2 = 'branch-a2-uuid';
  const BRANCH_B1 = 'branch-b1-uuid';

  beforeEach(async () => {
    staffRepo = createMockStaffMgmtRepository();
    assignmentRepo = createMockBranchAssignmentRepository();
    tenantRepo = createMockTenantRepository();
    branchRepo = createMockBranchRepository();
    tenantContext = createMockTenantContext(TENANT_A, BRANCH_A1);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffManagementService,
        { provide: StaffMgmtRepository, useValue: staffRepo },
        {
          provide: StaffBranchAssignmentRepository,
          useValue: assignmentRepo,
        },
        { provide: TenantRepository, useValue: tenantRepo },
        { provide: BranchRepository, useValue: branchRepo },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<StaffManagementService>(StaffManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ═══════════════════════════════════════════════════════
  //  create()
  // ═══════════════════════════════════════════════════════
  describe('create', () => {
    const createDto = {
      tenantId: TENANT_A,
      branchId: BRANCH_A1,
      userId: 1,
      institutionId: 1,
      designation: 'Senior Teacher',
      employmentType: 'full_time' as const,
      basicSalary: 50000,
      roles: ['teacher', 'coordinator'],
    } as CreateStaffMgmtDto;

    it('should create staff with tenant context and auto-generated staffId', async () => {
      const tenant = { id: TENANT_A, slug: 'abc-edu', name: 'ABC Education' };
      tenantRepo.findById.mockResolvedValue(tenant);
      staffRepo.findLastByStaffIdPrefix.mockResolvedValue(null);

      const savedStaff = {
        id: 1,
        staffId: 'abc-edu-STF-2026-0001',
        primaryBranchId: BRANCH_A1,
        ...createDto,
      };
      staffRepo.create.mockResolvedValue(savedStaff);

      const savedAssignment = {
        id: 1,
        tenantId: TENANT_A,
        staffEntityId: 1,
        branchId: BRANCH_A1,
        roles: ['teacher', 'coordinator'],
        isPrimary: true,
      };
      assignmentRepo.create.mockResolvedValue(savedAssignment);

      const result = await service.create(createDto);

      expect(result.staffId).toMatch(/^abc-edu-STF-\d{4}-0001$/);
      expect(result.tenantId).toBe(TENANT_A);
      expect(staffRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: TENANT_A,
          primaryBranchId: BRANCH_A1,
        }),
      );
      expect(assignmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          branchId: BRANCH_A1,
          isPrimary: true,
        }),
      );
    });

    it('should increment sequence when previous staff exist', async () => {
      const tenant = { id: TENANT_A, slug: 'abc-edu', name: 'ABC Education' };
      tenantRepo.findById.mockResolvedValue(tenant);
      staffRepo.findLastByStaffIdPrefix.mockResolvedValue({
        staffId: 'abc-edu-STF-2026-0005',
      });

      const savedStaff = {
        id: 2,
        staffId: 'abc-edu-STF-2026-0006',
        tenantId: TENANT_A,
        primaryBranchId: BRANCH_A1,
      };
      staffRepo.create.mockResolvedValue(savedStaff);
      assignmentRepo.create.mockResolvedValue({});

      const result = await service.create(createDto);
      expect(result.staffId).toBe('abc-edu-STF-2026-0006');
    });

    it('should throw if tenant not found', async () => {
      tenantRepo.findById.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should use branchId from context when available', async () => {
      const tenant = { id: TENANT_A, slug: 'abc-edu', name: 'ABC Education' };
      tenantRepo.findById.mockResolvedValue(tenant);
      staffRepo.findLastByStaffIdPrefix.mockResolvedValue(null);
      staffRepo.create.mockResolvedValue({
        id: 1,
        tenantId: TENANT_A,
        primaryBranchId: BRANCH_A1,
        staffId: 'abc-edu-STF-2026-0001',
      });
      assignmentRepo.create.mockResolvedValue({});

      await service.create(createDto);

      expect(staffRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ primaryBranchId: BRANCH_A1 }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  //  generateStaffId()
  // ═══════════════════════════════════════════════════════
  describe('generateStaffId', () => {
    it('should format as <slug>-STF-YYYY-0001 for first staff', async () => {
      const tenant = { id: TENANT_A, slug: 'abc-edu', name: 'ABC Education' };
      tenantRepo.findById.mockResolvedValue(tenant);
      staffRepo.findLastByStaffIdPrefix.mockResolvedValue(null);

      const result = await service.generateStaffId(TENANT_A);

      const year = new Date().getFullYear();
      expect(result).toBe(`abc-edu-STF-${year}-0001`);
    });

    it('should increment from last sequence number', async () => {
      const tenant = { id: TENANT_A, slug: 'abc-edu', name: 'ABC Education' };
      tenantRepo.findById.mockResolvedValue(tenant);
      staffRepo.findLastByStaffIdPrefix.mockResolvedValue({
        staffId: 'abc-edu-STF-2026-0042',
      });

      const result = await service.generateStaffId(TENANT_A);
      expect(result).toBe('abc-edu-STF-2026-0043');
    });

    it('should be tenant-scoped (different tenants have independent sequences)', async () => {
      const tenantA = { id: TENANT_A, slug: 'abc-edu', name: 'ABC' };
      const tenantB = { id: TENANT_B, slug: 'xyz-school', name: 'XYZ' };

      tenantRepo.findById.mockResolvedValueOnce(tenantA);
      staffRepo.findLastByStaffIdPrefix.mockResolvedValueOnce({
        staffId: 'abc-edu-STF-2026-0010',
      });

      const resultA = await service.generateStaffId(TENANT_A);
      expect(resultA).toBe('abc-edu-STF-2026-0011');

      tenantRepo.findById.mockResolvedValueOnce(tenantB);
      staffRepo.findLastByStaffIdPrefix.mockResolvedValueOnce(null);

      const resultB = await service.generateStaffId(TENANT_B);
      expect(resultB).toBe('xyz-school-STF-2026-0001');
    });
  });

  // ═══════════════════════════════════════════════════════
  //  assignToBranch()
  // ═══════════════════════════════════════════════════════
  describe('assignToBranch', () => {
    it('should create branch assignment within same tenant', async () => {
      const staff = { id: 1, tenantId: TENANT_A };
      const branch = { id: BRANCH_A2, tenantId: TENANT_A };

      staffRepo.findById.mockResolvedValue(staff);
      branchRepo.findById.mockResolvedValue(branch);
      assignmentRepo.findByStaffAndBranch.mockResolvedValue(null);
      assignmentRepo.create.mockResolvedValue({
        id: 2,
        tenantId: TENANT_A,
        staffEntityId: 1,
        branchId: BRANCH_A2,
        roles: ['teacher'],
        isPrimary: false,
      });

      const result = await service.assignToBranch(1, {
        tenantId: TENANT_A,
        branchId: BRANCH_A2,
        roles: ['teacher'],
        isPrimary: false,
      });

      expect(result.branchId).toBe(BRANCH_A2);
      expect(result.isPrimary).toBe(false);
    });

    it('should reject assignment to different tenant branch', async () => {
      const staff = { id: 1, tenantId: TENANT_A };
      const branch = { id: BRANCH_B1, tenantId: TENANT_B };

      staffRepo.findById.mockResolvedValue(staff);
      branchRepo.findById.mockResolvedValue(branch);

      await expect(
        service.assignToBranch(1, {
          tenantId: TENANT_A,
          branchId: BRANCH_B1,
          roles: ['teacher'],
          isPrimary: false,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if staff not found', async () => {
      staffRepo.findById.mockResolvedValue(null);

      await expect(
        service.assignToBranch(999, {
          tenantId: TENANT_A,
          branchId: BRANCH_A2,
          roles: ['teacher'],
          isPrimary: false,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if branch not found', async () => {
      staffRepo.findById.mockResolvedValue({ id: 1, tenantId: TENANT_A });
      branchRepo.findById.mockResolvedValue(null);

      await expect(
        service.assignToBranch(1, {
          tenantId: TENANT_A,
          branchId: 'nonexistent',
          roles: ['teacher'],
          isPrimary: false,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject duplicate branch assignment', async () => {
      staffRepo.findById.mockResolvedValue({ id: 1, tenantId: TENANT_A });
      branchRepo.findById.mockResolvedValue({
        id: BRANCH_A2,
        tenantId: TENANT_A,
      });
      assignmentRepo.findByStaffAndBranch.mockResolvedValue({
        id: 1,
        branchId: BRANCH_A2,
      });

      await expect(
        service.assignToBranch(1, {
          tenantId: TENANT_A,
          branchId: BRANCH_A2,
          roles: ['teacher'],
          isPrimary: false,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  transferBranch()
  // ═══════════════════════════════════════════════════════
  describe('transferBranch', () => {
    it('should transfer primary branch within same tenant', async () => {
      const staff = { id: 1, tenantId: TENANT_A, primaryBranchId: BRANCH_A1 };
      staffRepo.findById.mockResolvedValue(staff);
      branchRepo.findById.mockResolvedValue({
        id: BRANCH_A2,
        tenantId: TENANT_A,
      });
      assignmentRepo.findByStaffAndBranch.mockResolvedValue({
        id: 2,
        branchId: BRANCH_A2,
      });
      assignmentRepo.updatePrimaryFlag.mockResolvedValue(undefined);
      staffRepo.update.mockResolvedValue({
        ...staff,
        primaryBranchId: BRANCH_A2,
      });

      const result = await service.transferBranch(1, {
        tenantId: TENANT_A,
        fromBranchId: BRANCH_A1,
        toBranchId: BRANCH_A2,
      });

      expect(result.primaryBranchId).toBe(BRANCH_A2);
      expect(assignmentRepo.updatePrimaryFlag).toHaveBeenCalled();
    });

    it('should reject transfer to different tenant branch', async () => {
      const staff = { id: 1, tenantId: TENANT_A, primaryBranchId: BRANCH_A1 };
      staffRepo.findById.mockResolvedValue(staff);
      branchRepo.findById.mockResolvedValue({
        id: BRANCH_B1,
        tenantId: TENANT_B,
      });

      await expect(
        service.transferBranch(1, {
          tenantId: TENANT_A,
          fromBranchId: BRANCH_A1,
          toBranchId: BRANCH_B1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if staff not found', async () => {
      staffRepo.findById.mockResolvedValue(null);

      await expect(
        service.transferBranch(999, {
          tenantId: TENANT_A,
          fromBranchId: BRANCH_A1,
          toBranchId: BRANCH_A2,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create assignment to target if not exists', async () => {
      const staff = { id: 1, tenantId: TENANT_A, primaryBranchId: BRANCH_A1 };
      staffRepo.findById.mockResolvedValue(staff);
      branchRepo.findById.mockResolvedValue({
        id: BRANCH_A2,
        tenantId: TENANT_A,
      });
      assignmentRepo.findByStaffAndBranch.mockResolvedValue(null);
      assignmentRepo.create.mockResolvedValue({
        id: 3,
        branchId: BRANCH_A2,
        isPrimary: true,
      });
      assignmentRepo.updatePrimaryFlag.mockResolvedValue(undefined);
      staffRepo.update.mockResolvedValue({
        ...staff,
        primaryBranchId: BRANCH_A2,
      });

      await service.transferBranch(1, {
        tenantId: TENANT_A,
        fromBranchId: BRANCH_A1,
        toBranchId: BRANCH_A2,
      });

      expect(assignmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ branchId: BRANCH_A2, isPrimary: true }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  //  listByBranch()
  // ═══════════════════════════════════════════════════════
  describe('listByBranch', () => {
    it('should return staff filtered by branch', async () => {
      const staffList = [
        { id: 1, tenantId: TENANT_A, staffId: 'abc-edu-STF-2026-0001' },
      ];
      staffRepo.findByBranch.mockResolvedValue(staffList);

      const result = await service.listByBranch(BRANCH_A1);
      expect(result).toEqual(staffList);
      expect(staffRepo.findByBranch).toHaveBeenCalledWith(BRANCH_A1);
    });

    it('should include staff assigned to multiple branches', async () => {
      const staffList = [
        { id: 1, tenantId: TENANT_A, staffId: 'abc-edu-STF-2026-0001' },
        { id: 2, tenantId: TENANT_A, staffId: 'abc-edu-STF-2026-0002' },
      ];
      staffRepo.findByBranch.mockResolvedValue(staffList);

      const result = await service.listByBranch(BRANCH_A2);
      expect(result.length).toBe(2);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  findOne & remove
  // ═══════════════════════════════════════════════════════
  describe('findOne', () => {
    it('should return staff with branch assignments', async () => {
      const staff = {
        id: 1,
        tenantId: TENANT_A,
        staffId: 'abc-edu-STF-2026-0001',
        branchAssignments: [
          { branchId: BRANCH_A1, roles: ['teacher'], isPrimary: true },
        ],
      };
      staffRepo.findByIdWithAssignments.mockResolvedValue(staff);

      const result = await service.findOne(1);
      expect(result.branchAssignments).toBeDefined();
      expect(result.branchAssignments!.length).toBe(1);
    });

    it('should throw NotFoundException when not found', async () => {
      staffRepo.findByIdWithAssignments.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete staff', async () => {
      staffRepo.findById.mockResolvedValue({ id: 1, tenantId: TENANT_A });
      staffRepo.remove.mockResolvedValue(undefined);

      await service.remove(1);
      expect(staffRepo.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when not found', async () => {
      staffRepo.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ═══════════════════════════════════════════════════════
  //  getMyBranches()
  // ═══════════════════════════════════════════════════════
  describe('getMyBranches', () => {
    it('should return branch assignments for a userId', async () => {
      const assignments = [
        { branchId: BRANCH_A1, roles: ['teacher'], isPrimary: true },
        { branchId: BRANCH_A2, roles: ['coordinator'], isPrimary: false },
      ];
      assignmentRepo.findByUserAndTenant.mockResolvedValue(assignments);

      const result = await service.getMyBranches(1);
      expect(result.length).toBe(2);
    });
  });
});
