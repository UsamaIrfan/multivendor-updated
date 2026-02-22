import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from '../services/permission.service';
import { PermissionRepository } from '../infrastructure/persistence/permission.repository';
import { RolePermissionRepository } from '../infrastructure/persistence/role-permission.repository';
import { UserPermissionOverrideRepository } from '../infrastructure/persistence/user-permission-override.repository';
import { PermissionScopeEnum } from '../enums';
import { PermissionOverrideActionEnum } from '../enums';

describe('PermissionService', () => {
  let service: PermissionService;
  let permissionRepo: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    findByCode: jest.Mock;
    findByDomain: jest.Mock;
    findByCodes: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };
  let rolePermissionRepo: {
    create: jest.Mock;
    findByRoleId: jest.Mock;
    findEffectiveByRoleId: jest.Mock;
    remove: jest.Mock;
    removeAllByRoleId: jest.Mock;
  };
  let userOverrideRepo: {
    create: jest.Mock;
    findByUserAndTenant: jest.Mock;
    findOverridesByUserAndTenant: jest.Mock;
    remove: jest.Mock;
    removeByUserAndTenant: jest.Mock;
  };

  beforeEach(async () => {
    permissionRepo = {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      findByCode: jest.fn(),
      findByDomain: jest.fn().mockResolvedValue([]),
      findByCodes: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      remove: jest.fn(),
    };
    rolePermissionRepo = {
      create: jest.fn(),
      findByRoleId: jest.fn().mockResolvedValue([]),
      findEffectiveByRoleId: jest.fn().mockResolvedValue([]),
      remove: jest.fn(),
      removeAllByRoleId: jest.fn(),
    };
    userOverrideRepo = {
      create: jest.fn(),
      findByUserAndTenant: jest.fn().mockResolvedValue([]),
      findOverridesByUserAndTenant: jest.fn().mockResolvedValue([]),
      remove: jest.fn(),
      removeByUserAndTenant: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        { provide: PermissionRepository, useValue: permissionRepo },
        { provide: RolePermissionRepository, useValue: rolePermissionRepo },
        {
          provide: UserPermissionOverrideRepository,
          useValue: userOverrideRepo,
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  // ─── Permission CRUD ──────────────────────────────────

  it('should create a permission', async () => {
    const dto = {
      code: 'academic.student.read',
      domain: 'academic',
      description: 'View students',
    };
    permissionRepo.create.mockResolvedValue({ id: 1, ...dto });

    const result = await service.createPermission(dto);
    expect(result).toHaveProperty('id', 1);
    expect(permissionRepo.create).toHaveBeenCalledWith(dto);
  });

  it('should return all permissions', async () => {
    permissionRepo.findAll.mockResolvedValue([
      { id: 1, code: 'a.b.c', domain: 'a' },
    ]);

    const result = await service.findAllPermissions();
    expect(result).toHaveLength(1);
  });

  it('should find a permission by id', async () => {
    permissionRepo.findById.mockResolvedValue({
      id: 1,
      code: 'x.y.z',
      domain: 'x',
    });

    const result = await service.findPermissionById(1);
    expect(result).toHaveProperty('code', 'x.y.z');
  });

  it('should return null for non-existent permission', async () => {
    permissionRepo.findById.mockResolvedValue(null);
    const result = await service.findPermissionById(999);
    expect(result).toBeNull();
  });

  // ─── Effective Permission Resolution ──────────────────

  it('should resolve role-level permissions without overrides', async () => {
    rolePermissionRepo.findEffectiveByRoleId.mockResolvedValue([
      { code: 'academic.student.read', scope: PermissionScopeEnum.TENANT },
      { code: 'academic.student.create', scope: PermissionScopeEnum.BRANCH },
    ]);

    const result = await service.resolveEffectivePermissions(1, 10, null);
    expect(result.size).toBe(2);
    expect(result.get('academic.student.read')).toBe(
      PermissionScopeEnum.TENANT,
    );
    expect(result.get('academic.student.create')).toBe(
      PermissionScopeEnum.BRANCH,
    );
  });

  it('should apply REVOKE overrides', async () => {
    rolePermissionRepo.findEffectiveByRoleId.mockResolvedValue([
      { code: 'academic.student.read', scope: PermissionScopeEnum.TENANT },
      { code: 'academic.student.create', scope: PermissionScopeEnum.TENANT },
    ]);
    userOverrideRepo.findOverridesByUserAndTenant.mockResolvedValue([
      {
        code: 'academic.student.create',
        action: PermissionOverrideActionEnum.REVOKE,
        scope: null,
      },
    ]);

    const result = await service.resolveEffectivePermissions(
      1,
      10,
      'tenant-uuid',
    );
    expect(result.size).toBe(1);
    expect(result.has('academic.student.create')).toBe(false);
    expect(result.has('academic.student.read')).toBe(true);
  });

  it('should apply GRANT overrides with custom scope', async () => {
    rolePermissionRepo.findEffectiveByRoleId.mockResolvedValue([
      { code: 'academic.student.read', scope: PermissionScopeEnum.SECTION },
    ]);
    userOverrideRepo.findOverridesByUserAndTenant.mockResolvedValue([
      {
        code: 'hr.staff.create',
        action: PermissionOverrideActionEnum.GRANT,
        scope: PermissionScopeEnum.BRANCH,
      },
    ]);

    const result = await service.resolveEffectivePermissions(
      4,
      10,
      'tenant-uuid',
    );
    expect(result.size).toBe(2);
    expect(result.get('hr.staff.create')).toBe(PermissionScopeEnum.BRANCH);
    expect(result.get('academic.student.read')).toBe(
      PermissionScopeEnum.SECTION,
    );
  });

  it('should not apply user overrides when tenantId is null', async () => {
    rolePermissionRepo.findEffectiveByRoleId.mockResolvedValue([
      { code: 'academic.student.read', scope: PermissionScopeEnum.TENANT },
    ]);
    userOverrideRepo.findOverridesByUserAndTenant.mockResolvedValue([
      {
        code: 'academic.student.read',
        action: PermissionOverrideActionEnum.REVOKE,
        scope: null,
      },
    ]);

    const result = await service.resolveEffectivePermissions(1, 10, null);
    // Override should NOT be applied since tenantId is null
    expect(result.size).toBe(1);
    expect(result.has('academic.student.read')).toBe(true);
    expect(
      userOverrideRepo.findOverridesByUserAndTenant,
    ).not.toHaveBeenCalled();
  });

  // ─── Caching ──────────────────────────────────────────

  it('should cache permission resolution results', async () => {
    rolePermissionRepo.findEffectiveByRoleId.mockResolvedValue([
      { code: 'academic.student.read', scope: PermissionScopeEnum.TENANT },
    ]);

    // First call
    await service.resolveEffectivePermissions(1, 10, 'tenant-uuid');
    // Second call — should hit cache
    await service.resolveEffectivePermissions(1, 10, 'tenant-uuid');

    expect(rolePermissionRepo.findEffectiveByRoleId).toHaveBeenCalledTimes(1);
  });

  it('should return a new Map copy from cache (prevent mutation)', async () => {
    rolePermissionRepo.findEffectiveByRoleId.mockResolvedValue([
      { code: 'academic.student.read', scope: PermissionScopeEnum.TENANT },
    ]);

    const result1 = await service.resolveEffectivePermissions(
      1,
      10,
      'tenant-uuid',
    );
    result1.set('hacked', PermissionScopeEnum.PLATFORM);

    const result2 = await service.resolveEffectivePermissions(
      1,
      10,
      'tenant-uuid',
    );
    expect(result2.has('hacked')).toBe(false);
  });

  it('should invalidate cache for specific user', async () => {
    rolePermissionRepo.findEffectiveByRoleId.mockResolvedValue([
      { code: 'academic.student.read', scope: PermissionScopeEnum.TENANT },
    ]);

    await service.resolveEffectivePermissions(1, 10, 'tenant-uuid');
    service.invalidateCache(1, 10, 'tenant-uuid');
    await service.resolveEffectivePermissions(1, 10, 'tenant-uuid');

    expect(rolePermissionRepo.findEffectiveByRoleId).toHaveBeenCalledTimes(2);
  });

  // ─── Utilities ────────────────────────────────────────

  it('should convert permission map to effective permission array', () => {
    const map = new Map<string, PermissionScopeEnum>();
    map.set('academic.student.read', PermissionScopeEnum.TENANT);
    map.set('hr.staff.read', PermissionScopeEnum.SELF);

    const result = service.toEffectivePermissionArray(map);
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        { code: 'academic.student.read', scope: PermissionScopeEnum.TENANT },
        { code: 'hr.staff.read', scope: PermissionScopeEnum.SELF },
      ]),
    );
  });
});
