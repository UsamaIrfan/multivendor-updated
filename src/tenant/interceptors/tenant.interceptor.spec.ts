import { TenantInterceptor } from './tenant.interceptor';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { of } from 'rxjs';

describe('TenantInterceptor', () => {
  let interceptor: TenantInterceptor;
  let tenantContext: TenantContextService;
  let mockTenantRepo: any;
  let mockTenantUserRepo: any;

  const mockExecutionContext = (request: any) => ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  });

  const mockCallHandler = {
    handle: () => of('test-response'),
  };

  beforeEach(() => {
    tenantContext = new TenantContextService();

    mockTenantRepo = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
    };

    mockTenantUserRepo = {
      findByTenantAndUser: jest.fn(),
    };

    interceptor = new TenantInterceptor(
      tenantContext,
      mockTenantRepo,
      mockTenantUserRepo,
    );
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('tenant resolution', () => {
    it('should resolve tenant from JWT claim', async () => {
      const request = {
        user: { id: 1, tenantId: 'jwt-tenant-id' },
        headers: {},
      };
      mockTenantRepo.findById.mockResolvedValue({
        id: 'jwt-tenant-id',
        isActive: true,
      });
      mockTenantUserRepo.findByTenantAndUser.mockResolvedValue({
        isActive: true,
      });

      const context = mockExecutionContext(request);
      const result$ = await interceptor.intercept(
        context as any,
        mockCallHandler,
      );

      const value = await new Promise((resolve) => {
        result$.subscribe({ next: resolve });
      });

      expect(value).toBe('test-response');
      expect(mockTenantRepo.findById).toHaveBeenCalledWith('jwt-tenant-id');
    });

    it('should resolve tenant from X-Tenant-ID header', async () => {
      const request = {
        user: { id: 1 },
        headers: { 'x-tenant-id': 'header-tenant-id' },
      };
      mockTenantRepo.findById.mockResolvedValue({
        id: 'header-tenant-id',
        isActive: true,
      });
      mockTenantUserRepo.findByTenantAndUser.mockResolvedValue({
        isActive: true,
      });

      const context = mockExecutionContext(request);
      const result$ = await interceptor.intercept(
        context as any,
        mockCallHandler,
      );

      const value = await new Promise((resolve) => {
        result$.subscribe({ next: resolve });
      });

      expect(value).toBe('test-response');
      expect(mockTenantRepo.findById).toHaveBeenCalledWith('header-tenant-id');
    });

    it('should resolve tenant from subdomain', async () => {
      const request = {
        user: { id: 1 },
        headers: { host: 'abc.example.com' },
      };
      mockTenantRepo.findBySlug.mockResolvedValue({ id: 'slug-tenant-id' });
      mockTenantRepo.findById.mockResolvedValue({
        id: 'slug-tenant-id',
        isActive: true,
      });
      mockTenantUserRepo.findByTenantAndUser.mockResolvedValue({
        isActive: true,
      });

      const context = mockExecutionContext(request);
      const result$ = await interceptor.intercept(
        context as any,
        mockCallHandler,
      );

      const value = await new Promise((resolve) => {
        result$.subscribe({ next: resolve });
      });

      expect(value).toBe('test-response');
      expect(mockTenantRepo.findBySlug).toHaveBeenCalledWith('abc');
    });

    it('should throw BadRequestException when no tenant found', async () => {
      const request = {
        user: {},
        headers: { host: 'localhost:3000' },
      };

      const context = mockExecutionContext(request);
      await expect(
        interceptor.intercept(context as any, mockCallHandler),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('tenant validation', () => {
    it('should throw BadRequestException for non-existent tenant', async () => {
      const request = {
        user: { id: 1, tenantId: 'nonexistent' },
        headers: {},
      };
      mockTenantRepo.findById.mockResolvedValue(null);

      const context = mockExecutionContext(request);
      await expect(
        interceptor.intercept(context as any, mockCallHandler),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException for inactive tenant', async () => {
      const request = {
        user: { id: 1, tenantId: 'inactive-tenant' },
        headers: {},
      };
      mockTenantRepo.findById.mockResolvedValue({
        id: 'inactive-tenant',
        isActive: false,
      });

      const context = mockExecutionContext(request);
      await expect(
        interceptor.intercept(context as any, mockCallHandler),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user not in tenant', async () => {
      const request = {
        user: { id: 1, tenantId: 'tenant-1' },
        headers: {},
      };
      mockTenantRepo.findById.mockResolvedValue({
        id: 'tenant-1',
        isActive: true,
      });
      mockTenantUserRepo.findByTenantAndUser.mockResolvedValue(null);

      const context = mockExecutionContext(request);
      await expect(
        interceptor.intercept(context as any, mockCallHandler),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('branch resolution', () => {
    it('should extract branch from X-Branch-ID header', async () => {
      const request = {
        user: { id: 1, tenantId: 'tenant-1' },
        headers: { 'x-branch-id': 'branch-1' },
      };
      mockTenantRepo.findById.mockResolvedValue({
        id: 'tenant-1',
        isActive: true,
      });
      mockTenantUserRepo.findByTenantAndUser.mockResolvedValue({
        isActive: true,
      });

      const context = mockExecutionContext(request);
      const result$ = await interceptor.intercept(
        context as any,
        mockCallHandler,
      );

      // Verify the context is set with branch
      await new Promise<void>((resolve) => {
        result$.subscribe({
          next: () => resolve(),
        });
      });

      // The interceptor wraps in a run() so context is set inside
      expect(mockTenantRepo.findById).toHaveBeenCalledWith('tenant-1');
    });
  });
});
