import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantRepository } from './infrastructure/persistence/tenant.repository';
import { BranchRepository } from './infrastructure/persistence/branch.repository';
import { TenantUserRepository } from './infrastructure/persistence/tenant-user.repository';

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
    findById: jest.fn(),
    findByTenantAndCode: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

function createMockTenantUserRepo() {
  return {
    create: jest.fn(),
    findByTenantAndUser: jest.fn(),
    findAllByUser: jest.fn(),
    findAllByTenant: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };
}

describe('TenantService', () => {
  let service: TenantService;
  let tenantRepo: ReturnType<typeof createMockTenantRepo>;
  let branchRepo: ReturnType<typeof createMockBranchRepo>;
  let tenantUserRepo: ReturnType<typeof createMockTenantUserRepo>;

  beforeEach(async () => {
    tenantRepo = createMockTenantRepo();
    branchRepo = createMockBranchRepo();
    tenantUserRepo = createMockTenantUserRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: TenantRepository, useValue: tenantRepo },
        { provide: BranchRepository, useValue: branchRepo },
        { provide: TenantUserRepository, useValue: tenantUserRepo },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Tenants ──────────────────────────────────────────
  describe('Tenants', () => {
    const mockTenant = {
      id: 'uuid-1',
      name: 'Test Tenant',
      slug: 'test-tenant',
      isActive: true,
    };

    describe('createTenant', () => {
      it('should create a tenant', async () => {
        tenantRepo.findBySlug.mockResolvedValue(null);
        tenantRepo.create.mockResolvedValue(mockTenant);

        const result = await service.createTenant({
          name: 'Test Tenant',
          slug: 'test-tenant',
        });
        expect(result).toEqual(mockTenant);
        expect(tenantRepo.create).toHaveBeenCalled();
      });

      it('should throw ConflictException if slug exists', async () => {
        tenantRepo.findBySlug.mockResolvedValue(mockTenant);

        await expect(
          service.createTenant({
            name: 'Another',
            slug: 'test-tenant',
          }),
        ).rejects.toThrow(ConflictException);
      });
    });

    describe('findAllTenants', () => {
      it('should return all tenants', async () => {
        tenantRepo.findAll.mockResolvedValue([mockTenant]);
        const result = await service.findAllTenants();
        expect(result).toEqual([mockTenant]);
      });
    });

    describe('findOneTenant', () => {
      it('should return a tenant by id', async () => {
        tenantRepo.findById.mockResolvedValue(mockTenant);
        const result = await service.findOneTenant('uuid-1');
        expect(result).toEqual(mockTenant);
      });

      it('should throw NotFoundException if not found', async () => {
        tenantRepo.findById.mockResolvedValue(null);
        await expect(service.findOneTenant('uuid-999')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateTenant', () => {
      it('should update a tenant', async () => {
        tenantRepo.findById.mockResolvedValue(mockTenant);
        tenantRepo.update.mockResolvedValue({
          ...mockTenant,
          name: 'Updated',
        });

        const result = await service.updateTenant('uuid-1', {
          name: 'Updated',
        });
        expect(result.name).toBe('Updated');
      });

      it('should throw NotFoundException if tenant does not exist', async () => {
        tenantRepo.findById.mockResolvedValue(null);
        await expect(
          service.updateTenant('uuid-999', { name: 'X' }),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('removeTenant', () => {
      it('should soft-delete a tenant', async () => {
        tenantRepo.findById.mockResolvedValue(mockTenant);
        tenantRepo.remove.mockResolvedValue(undefined);

        await service.removeTenant('uuid-1');
        expect(tenantRepo.remove).toHaveBeenCalledWith('uuid-1');
      });
    });
  });

  // ─── Branches ─────────────────────────────────────────
  describe('Branches', () => {
    const mockBranch = {
      id: 'branch-1',
      tenantId: 'uuid-1',
      name: 'Main',
      code: 'MAIN',
    };

    describe('createBranch', () => {
      it('should create a branch', async () => {
        tenantRepo.findById.mockResolvedValue({ id: 'uuid-1' });
        branchRepo.findByTenantAndCode.mockResolvedValue(null);
        branchRepo.create.mockResolvedValue(mockBranch);

        const result = await service.createBranch({
          tenantId: 'uuid-1',
          name: 'Main',
          code: 'MAIN',
        });
        expect(result).toEqual(mockBranch);
      });

      it('should throw NotFoundException if tenant does not exist', async () => {
        tenantRepo.findById.mockResolvedValue(null);
        await expect(
          service.createBranch({
            tenantId: 'uuid-999',
            name: 'X',
            code: 'X',
          }),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('findAllBranches', () => {
      it('should return branches for a tenant', async () => {
        branchRepo.findAllByTenant.mockResolvedValue([mockBranch]);
        const result = await service.findAllBranches('uuid-1');
        expect(result).toEqual([mockBranch]);
      });
    });

    describe('findOneBranch', () => {
      it('should return a branch by id', async () => {
        branchRepo.findById.mockResolvedValue(mockBranch);
        const result = await service.findOneBranch('branch-1');
        expect(result).toEqual(mockBranch);
      });

      it('should throw NotFoundException if not found', async () => {
        branchRepo.findById.mockResolvedValue(null);
        await expect(service.findOneBranch('branch-999')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  // ─── Tenant Users ─────────────────────────────────────
  describe('Tenant Users', () => {
    const mockTenantUser = {
      id: 'tu-1',
      tenantId: 'uuid-1',
      userId: 1,
      isActive: true,
    };

    describe('assignUserToTenant', () => {
      it('should assign a user to a tenant', async () => {
        tenantRepo.findById.mockResolvedValue({ id: 'uuid-1' });
        tenantUserRepo.findByTenantAndUser.mockResolvedValue(null);
        tenantUserRepo.create.mockResolvedValue(mockTenantUser);

        const result = await service.assignUserToTenant({
          tenantId: 'uuid-1',
          userId: 1,
        });
        expect(result).toEqual(mockTenantUser);
      });

      it('should throw ConflictException if already assigned', async () => {
        tenantRepo.findById.mockResolvedValue({ id: 'uuid-1' });
        tenantUserRepo.findByTenantAndUser.mockResolvedValue(mockTenantUser);

        await expect(
          service.assignUserToTenant({
            tenantId: 'uuid-1',
            userId: 1,
          }),
        ).rejects.toThrow(ConflictException);
      });
    });

    describe('findTenantsByUser', () => {
      it('should return tenants for a user', async () => {
        tenantUserRepo.findAllByUser.mockResolvedValue([mockTenantUser]);
        const result = await service.findTenantsByUser(1);
        expect(result).toEqual([mockTenantUser]);
      });
    });

    describe('removeUserFromTenant', () => {
      it('should remove a user from a tenant', async () => {
        tenantUserRepo.findByTenantAndUser.mockResolvedValue(mockTenantUser);
        tenantUserRepo.remove.mockResolvedValue(undefined);

        await service.removeUserFromTenant('uuid-1', 1);
        expect(tenantUserRepo.remove).toHaveBeenCalledWith('tu-1');
      });

      it('should throw NotFoundException if not assigned', async () => {
        tenantUserRepo.findByTenantAndUser.mockResolvedValue(null);
        await expect(service.removeUserFromTenant('uuid-1', 1)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
