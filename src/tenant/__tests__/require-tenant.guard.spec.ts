import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequireTenantGuard } from '../guards/require-tenant.guard';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { SKIP_TENANT_CHECK_KEY } from '../decorators/skip-tenant-check.decorator';

function createMockContext(
  user?: any,
  headers?: Record<string, string>,
  handler?: any,
  classRef?: any,
): ExecutionContext {
  const request = { user, headers: headers ?? {} };
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

describe('RequireTenantGuard', () => {
  let guard: RequireTenantGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequireTenantGuard,
        Reflector,
        {
          provide: TenantContextService,
          useValue: { hasContext: jest.fn().mockReturnValue(false) },
        },
      ],
    }).compile();

    guard = module.get<RequireTenantGuard>(RequireTenantGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should allow when tenant is present in JWT user claim', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const ctx = createMockContext({ id: 1, tenantId: 'some-uuid' }, {});
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow when tenant is present in X-Tenant-ID header', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const ctx = createMockContext(
      { id: 1 }, // no tenantId in JWT
      { 'x-tenant-id': 'some-uuid' },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw ForbiddenException when no tenant in JWT or header', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const ctx = createMockContext(
      { id: 1 }, // no tenantId
      {}, // no X-Tenant-ID header
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user is undefined', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const ctx = createMockContext(undefined, {});
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should allow when @SkipTenantCheck is set on handler', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const ctx = createMockContext(undefined, {}); // no tenant at all
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should check the correct metadata key for skip', () => {
    const spy = jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(false);

    const handler = jest.fn();
    const classRef = jest.fn() as any;
    const ctx = createMockContext(
      { id: 1, tenantId: 'uuid' },
      {},
      handler,
      classRef,
    );
    guard.canActivate(ctx);

    expect(spy).toHaveBeenCalledWith(SKIP_TENANT_CHECK_KEY, [
      handler,
      classRef,
    ]);
  });

  it('should include helpful message in ForbiddenException', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const ctx = createMockContext({ id: 1 }, {});
    try {
      guard.canActivate(ctx);
      fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ForbiddenException);
      expect((err as ForbiddenException).message).toContain(
        'tenant must be selected',
      );
    }
  });
});
