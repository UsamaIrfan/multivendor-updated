import { TenantContextService } from './tenant-context.service';

describe('TenantContextService', () => {
  let service: TenantContextService;

  beforeEach(() => {
    service = new TenantContextService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run & getContext', () => {
    it('should return undefined when no context is set', () => {
      expect(service.getContext()).toBeUndefined();
    });

    it('should return the context set via run()', () => {
      const ctx = { tenantId: 'tenant-1', branchId: 'branch-1' };
      service.run(ctx, () => {
        expect(service.getContext()).toEqual(ctx);
      });
    });

    it('should isolate contexts between nested runs', () => {
      const ctx1 = { tenantId: 'tenant-1', branchId: null };
      const ctx2 = { tenantId: 'tenant-2', branchId: 'branch-2' };

      service.run(ctx1, () => {
        expect(service.getTenantId()).toBe('tenant-1');
        service.run(ctx2, () => {
          expect(service.getTenantId()).toBe('tenant-2');
          expect(service.getBranchId()).toBe('branch-2');
        });
        expect(service.getTenantId()).toBe('tenant-1');
      });
    });

    it('should work with async code inside run()', async () => {
      const ctx = { tenantId: 'async-tenant', branchId: null };
      await new Promise<void>((resolve) => {
        service.run(ctx, () => {
          setTimeout(() => {
            expect(service.getTenantId()).toBe('async-tenant');
            resolve();
          }, 10);
        });
      });
    });
  });

  describe('getTenantId', () => {
    it('should throw when no context is available', () => {
      expect(() => service.getTenantId()).toThrow(
        'Tenant context is not available',
      );
    });

    it('should return tenant id from context', () => {
      service.run({ tenantId: 'test-tenant', branchId: null }, () => {
        expect(service.getTenantId()).toBe('test-tenant');
      });
    });
  });

  describe('getBranchId', () => {
    it('should return undefined when no context', () => {
      expect(service.getBranchId()).toBeUndefined();
    });

    it('should return null when context has no branch', () => {
      service.run({ tenantId: 'test', branchId: null }, () => {
        expect(service.getBranchId()).toBeNull();
      });
    });

    it('should return branch id from context', () => {
      service.run({ tenantId: 'test', branchId: 'branch-1' }, () => {
        expect(service.getBranchId()).toBe('branch-1');
      });
    });
  });

  describe('hasContext', () => {
    it('should return false when no context', () => {
      expect(service.hasContext()).toBe(false);
    });

    it('should return true inside run()', () => {
      service.run({ tenantId: 'test', branchId: null }, () => {
        expect(service.hasContext()).toBe(true);
      });
    });
  });
});
