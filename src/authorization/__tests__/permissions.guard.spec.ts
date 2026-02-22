import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from '../guards/permissions.guard';
import { PermissionService } from '../services/permission.service';
import { ScopeResolverService } from '../services/scope-resolver.service';
import { PermissionScopeEnum } from '../enums';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { ScopeContext } from '../domain/authorization-context';

const defaultScopeContext: ScopeContext = {
  allowedSectionIds: [],
  allowedStudentIds: [],
  staffId: null,
  studentId: null,
};

function createMockContext(
  user?: any,
  authorizationContext?: any,
  handler?: Type<any>,
  classRef?: Type<any>,
  headers?: any,
): ExecutionContext {
  const request = { user, authorizationContext, headers: headers ?? {} };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
    getHandler: () => handler ?? jest.fn(),
    getClass: () => classRef ?? (jest.fn() as any),
    getType: () => 'http' as const,
    getArgs: () => [request, {}, jest.fn()],
    getArgByIndex: (index: number) => [request, {}, jest.fn()][index],
    switchToRpc: jest.fn() as any,
    switchToWs: jest.fn() as any,
  } as ExecutionContext;
}

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;
  let permissionService: { resolveEffectivePermissions: jest.Mock };
  let scopeResolverService: { resolve: jest.Mock };

  beforeEach(async () => {
    permissionService = {
      resolveEffectivePermissions: jest.fn().mockResolvedValue(new Map()),
    };
    scopeResolverService = {
      resolve: jest.fn().mockResolvedValue(defaultScopeContext),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        Reflector,
        { provide: PermissionService, useValue: permissionService },
        { provide: ScopeResolverService, useValue: scopeResolverService },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should allow when no @RequirePermissions is set', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const ctx = createMockContext(undefined);
    expect(await guard.canActivate(ctx)).toBe(true);
  });

  it('should allow when @RequirePermissions has empty array', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

    const ctx = createMockContext(undefined);
    expect(await guard.canActivate(ctx)).toBe(true);
  });

  it('should deny when permissions required but no authenticated user', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['academic.student.read']);

    const ctx = createMockContext(undefined);
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should resolve permissions and allow when user has required permission', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['academic.student.read']);

    const permissions = new Map<string, PermissionScopeEnum>();
    permissions.set('academic.student.read', PermissionScopeEnum.TENANT);
    permissionService.resolveEffectivePermissions.mockResolvedValue(
      permissions,
    );

    const user = { id: 1, role: { id: 1 }, tenantId: 'tenant-1' };
    const ctx = createMockContext(user);
    expect(await guard.canActivate(ctx)).toBe(true);

    // Verify authorizationContext was attached to request
    const request = ctx.switchToHttp().getRequest();
    expect(request.authorizationContext).toBeDefined();
    expect(request.authorizationContext.userId).toBe(1);
    expect(request.authorizationContext.permissions).toBe(permissions);
  });

  it('should use existing authorizationContext if already present', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['academic.student.read']);

    const permissions = new Map<string, PermissionScopeEnum>();
    permissions.set('academic.student.read', PermissionScopeEnum.TENANT);

    const existingCtx = {
      userId: 1,
      roleId: 1,
      tenantId: 'tenant-1',
      branchId: null,
      permissions,
      scopeContext: defaultScopeContext,
    };

    const user = { id: 1, role: { id: 1 }, tenantId: 'tenant-1' };
    const ctx = createMockContext(user, existingCtx);
    expect(await guard.canActivate(ctx)).toBe(true);

    // Should NOT have called resolve since context was pre-populated
    expect(
      permissionService.resolveEffectivePermissions,
    ).not.toHaveBeenCalled();
    expect(scopeResolverService.resolve).not.toHaveBeenCalled();
  });

  it('should deny when user lacks the required permission', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['academic.student.create']);

    const permissions = new Map<string, PermissionScopeEnum>();
    permissions.set('academic.student.read', PermissionScopeEnum.TENANT);
    permissionService.resolveEffectivePermissions.mockResolvedValue(
      permissions,
    );

    const user = { id: 1, role: { id: 1 }, tenantId: 'tenant-1' };
    const ctx = createMockContext(user);
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should allow with OR logic — one of multiple permissions matches', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['academic.student.create', 'academic.student.read']);

    const permissions = new Map<string, PermissionScopeEnum>();
    permissions.set('academic.student.read', PermissionScopeEnum.SECTION);
    permissionService.resolveEffectivePermissions.mockResolvedValue(
      permissions,
    );

    const user = { id: 2, role: { id: 4 }, tenantId: 'tenant-1' };
    const ctx = createMockContext(user);
    expect(await guard.canActivate(ctx)).toBe(true);
  });

  it('should deny when user has none of the OR-listed permissions', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['system.permission.manage', 'system.role.manage']);

    const permissions = new Map<string, PermissionScopeEnum>();
    permissions.set('academic.student.read', PermissionScopeEnum.SELF);
    permissionService.resolveEffectivePermissions.mockResolvedValue(
      permissions,
    );

    const user = { id: 3, role: { id: 3 }, tenantId: 'tenant-1' };
    const ctx = createMockContext(user);
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should read metadata from handler first, then class', async () => {
    const spy = jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(undefined);

    const handler = jest.fn();
    const clazz = jest.fn();
    const ctx = createMockContext(undefined, undefined, handler, clazz);

    await guard.canActivate(ctx);

    expect(spy).toHaveBeenCalledWith(PERMISSIONS_KEY, [handler, clazz]);
  });

  it('should deny when permission resolution throws an error', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['academic.student.read']);

    permissionService.resolveEffectivePermissions.mockRejectedValue(
      new Error('DB error'),
    );

    const user = { id: 1, role: { id: 1 }, tenantId: 'tenant-1' };
    const ctx = createMockContext(user);
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should pass branchId from x-branch-id header', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['academic.student.read']);

    const permissions = new Map<string, PermissionScopeEnum>();
    permissions.set('academic.student.read', PermissionScopeEnum.BRANCH);
    permissionService.resolveEffectivePermissions.mockResolvedValue(
      permissions,
    );

    const user = { id: 1, role: { id: 1 }, tenantId: 'tenant-1' };
    const headers = { 'x-branch-id': 'branch-uuid' };
    const ctx = createMockContext(user, undefined, undefined, undefined, headers);
    await guard.canActivate(ctx);

    expect(scopeResolverService.resolve).toHaveBeenCalledWith(
      1,
      1,
      'tenant-1',
      'branch-uuid',
    );

    const request = ctx.switchToHttp().getRequest();
    expect(request.authorizationContext.branchId).toBe('branch-uuid');
  });
});
