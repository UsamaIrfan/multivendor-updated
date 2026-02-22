import { Test, TestingModule } from '@nestjs/testing';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { PermissionInterceptor } from '../interceptors/permission.interceptor';
import { PermissionService } from '../services/permission.service';
import { ScopeResolverService } from '../services/scope-resolver.service';
import { PermissionScopeEnum } from '../enums';

function createMockExecutionContext(
  user: any,
  headers: any = {},
  existingAuthCtx?: any,
): ExecutionContext {
  const request = {
    user,
    headers,
    authorizationContext: existingAuthCtx ?? undefined,
  };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    getType: () => 'http' as const,
    getArgs: () => [request, {}, jest.fn()],
    getArgByIndex: (index: number) => [request, {}, jest.fn()][index],
    switchToRpc: jest.fn() as any,
    switchToWs: jest.fn() as any,
  } as ExecutionContext;
}

describe('PermissionInterceptor', () => {
  let interceptor: PermissionInterceptor;
  let permissionService: { resolveEffectivePermissions: jest.Mock };
  let scopeResolverService: { resolve: jest.Mock };
  let nextHandler: CallHandler;

  beforeEach(async () => {
    permissionService = {
      resolveEffectivePermissions: jest.fn().mockResolvedValue(new Map()),
    };
    scopeResolverService = {
      resolve: jest.fn().mockResolvedValue({
        allowedSectionIds: [],
        allowedStudentIds: [],
        staffId: null,
        studentId: null,
      }),
    };
    nextHandler = { handle: () => of('response') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionInterceptor,
        { provide: PermissionService, useValue: permissionService },
        { provide: ScopeResolverService, useValue: scopeResolverService },
      ],
    }).compile();

    interceptor = module.get<PermissionInterceptor>(PermissionInterceptor);
  });

  it('should skip authorization context when no user is present', async () => {
    const ctx = createMockExecutionContext(null);
    const result = await interceptor.intercept(ctx, nextHandler);

    expect(result).toBeDefined();
    expect(
      permissionService.resolveEffectivePermissions,
    ).not.toHaveBeenCalled();
    expect(scopeResolverService.resolve).not.toHaveBeenCalled();
  });

  it('should skip authorization context when user has no role', async () => {
    const ctx = createMockExecutionContext({ id: 1 });
    const result = await interceptor.intercept(ctx, nextHandler);

    expect(result).toBeDefined();
    expect(
      permissionService.resolveEffectivePermissions,
    ).not.toHaveBeenCalled();
  });

  it('should attach authorizationContext to request for authenticated user', async () => {
    const permissions = new Map<string, PermissionScopeEnum>();
    permissions.set('academic.student.read', PermissionScopeEnum.TENANT);

    permissionService.resolveEffectivePermissions.mockResolvedValue(
      permissions,
    );
    scopeResolverService.resolve.mockResolvedValue({
      allowodSectionIds: [1, 2],
      allowedStudentIds: [],
      staffId: 5,
      studentId: null,
    });

    const user = { id: 10, role: { id: 1 }, tenantId: 'tenant-uuid' };
    const ctx = createMockExecutionContext(user);
    await interceptor.intercept(ctx, nextHandler);

    const request = ctx.switchToHttp().getRequest();
    expect(request.authorizationContext).toBeDefined();
    expect(request.authorizationContext.userId).toBe(10);
    expect(request.authorizationContext.roleId).toBe(1);
    expect(request.authorizationContext.tenantId).toBe('tenant-uuid');
    expect(request.authorizationContext.permissions).toBe(permissions);
  });

  it('should resolve permissions and scope in parallel', async () => {
    const user = { id: 1, role: { id: 4 }, tenantId: 'tenant-uuid' };
    const headers = { 'x-branch-id': 'branch-uuid' };
    const ctx = createMockExecutionContext(user, headers);

    await interceptor.intercept(ctx, nextHandler);

    expect(permissionService.resolveEffectivePermissions).toHaveBeenCalledWith(
      4,
      1,
      'tenant-uuid',
    );
    expect(scopeResolverService.resolve).toHaveBeenCalledWith(
      1,
      4,
      'tenant-uuid',
      'branch-uuid',
    );
  });

  it('should pass null tenantId when user has no tenantId', async () => {
    const user = { id: 1, role: { id: 1 } };
    const ctx = createMockExecutionContext(user);

    await interceptor.intercept(ctx, nextHandler);

    expect(permissionService.resolveEffectivePermissions).toHaveBeenCalledWith(
      1,
      1,
      null,
    );
    expect(scopeResolverService.resolve).toHaveBeenCalledWith(1, 1, null, null);
  });

  it('should not block request when permission resolution fails', async () => {
    permissionService.resolveEffectivePermissions.mockRejectedValue(
      new Error('DB error'),
    );

    const user = { id: 1, role: { id: 1 }, tenantId: 'tenant-uuid' };
    const ctx = createMockExecutionContext(user);

    // Should not throw
    const result = await interceptor.intercept(ctx, nextHandler);
    expect(result).toBeDefined();

    // authorizationContext should NOT be set (guard will deny if needed)
    const request = ctx.switchToHttp().getRequest();
    expect(request.authorizationContext).toBeUndefined();
  });

  it('should read branchId from x-branch-id header', async () => {
    const user = { id: 1, role: { id: 1 }, tenantId: 'tenant-uuid' };
    const headers = { 'x-branch-id': 'my-branch' };
    const ctx = createMockExecutionContext(user, headers);

    await interceptor.intercept(ctx, nextHandler);

    const request = ctx.switchToHttp().getRequest();
    expect(request.authorizationContext.branchId).toBe('my-branch');
  });

  it('should skip resolution when authorizationContext is already set', async () => {
    const existingCtx = {
      userId: 10,
      roleId: 1,
      tenantId: 'tenant-uuid',
      branchId: null,
      permissions: new Map([
        ['academic.student.read', PermissionScopeEnum.TENANT],
      ]),
      scopeContext: {
        allowedSectionIds: [],
        allowedStudentIds: [],
        staffId: null,
        studentId: null,
      },
    };

    const user = { id: 10, role: { id: 1 }, tenantId: 'tenant-uuid' };
    const ctx = createMockExecutionContext(user, {}, existingCtx);

    const result = await interceptor.intercept(ctx, nextHandler);
    expect(result).toBeDefined();

    // Should NOT have called any resolution services
    expect(
      permissionService.resolveEffectivePermissions,
    ).not.toHaveBeenCalled();
    expect(scopeResolverService.resolve).not.toHaveBeenCalled();

    // Should still have the original context
    const request = ctx.switchToHttp().getRequest();
    expect(request.authorizationContext).toBe(existingCtx);
  });
});
