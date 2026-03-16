import { TenantUserMapper } from '../infrastructure/persistence/relational/mappers/tenant-user.mapper';
import { TenantUserEntity } from '../infrastructure/persistence/relational/entities/tenant-user.entity';
import { TenantUser } from '../domain/tenant-user';

function makeMockEntity(
  overrides: Partial<TenantUserEntity> = {},
): TenantUserEntity {
  const entity = new TenantUserEntity();
  entity.id = 'tu-uuid-1';
  entity.tenant = { id: 'tenant-uuid-1', name: 'Acme School' } as any;
  entity.user = {
    id: 42,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: { id: 1 },
  } as any;
  entity.isActive = true;
  entity.createdAt = new Date('2026-01-01');
  entity.updatedAt = new Date('2026-01-02');
  entity.deletedAt = undefined as any;
  Object.assign(entity, overrides);
  return entity;
}

describe('TenantUserMapper', () => {
  describe('toDomain', () => {
    it('should map basic fields correctly', () => {
      const entity = makeMockEntity();
      const domain = TenantUserMapper.toDomain(entity);

      expect(domain).toBeInstanceOf(TenantUser);
      expect(domain.id).toBe('tu-uuid-1');
      expect(domain.tenantId).toBe('tenant-uuid-1');
      expect(domain.tenantName).toBe('Acme School');
      expect(domain.userId).toBe(42);
      expect(domain.isActive).toBe(true);
      expect(domain.createdAt).toEqual(new Date('2026-01-01'));
      expect(domain.updatedAt).toEqual(new Date('2026-01-02'));
    });

    it('should map user details (userName, userEmail, userRole) from entity', () => {
      const entity = makeMockEntity();
      const domain = TenantUserMapper.toDomain(entity);

      expect(domain.userName).toBe('John Doe');
      expect(domain.userEmail).toBe('john@example.com');
      expect(domain.userRole).toBe(1);
    });

    it('should handle user with only firstName', () => {
      const entity = makeMockEntity({
        user: {
          id: 10,
          firstName: 'Alice',
          lastName: null,
          email: 'alice@test.com',
          role: { id: 3 },
        } as any,
      });
      const domain = TenantUserMapper.toDomain(entity);

      expect(domain.userName).toBe('Alice');
      expect(domain.userEmail).toBe('alice@test.com');
      expect(domain.userRole).toBe(3);
    });

    it('should handle missing user relation gracefully', () => {
      const entity = makeMockEntity({ user: undefined as any });
      const domain = TenantUserMapper.toDomain(entity);

      expect(domain.userId).toBeUndefined();
      expect(domain.userName).toBeUndefined();
      expect(domain.userEmail).toBeUndefined();
      expect(domain.userRole).toBeUndefined();
    });

    it('should handle user with null email', () => {
      const entity = makeMockEntity({
        user: {
          id: 5,
          firstName: 'Bob',
          lastName: 'Smith',
          email: null,
          role: { id: 2 },
        } as any,
      });
      const domain = TenantUserMapper.toDomain(entity);

      expect(domain.userName).toBe('Bob Smith');
      expect(domain.userEmail).toBeUndefined();
    });

    it('should handle user with no role', () => {
      const entity = makeMockEntity({
        user: {
          id: 5,
          firstName: 'NoRole',
          lastName: 'User',
          email: 'norole@test.com',
          role: null,
        } as any,
      });
      const domain = TenantUserMapper.toDomain(entity);

      expect(domain.userRole).toBeUndefined();
    });
  });

  describe('toPersistence', () => {
    it('should map domain to entity correctly', () => {
      const domain = new TenantUser();
      domain.id = 'tu-uuid-1';
      domain.tenantId = 'tenant-uuid-1';
      domain.userId = 42;
      domain.isActive = true;
      domain.createdAt = new Date('2026-01-01');
      domain.updatedAt = new Date('2026-01-02');

      const entity = TenantUserMapper.toPersistence(domain);

      expect(entity).toBeInstanceOf(TenantUserEntity);
      expect(entity.id).toBe('tu-uuid-1');
      expect(entity.tenant).toEqual({ id: 'tenant-uuid-1' });
      expect(entity.user).toEqual({ id: 42 });
      expect(entity.isActive).toBe(true);
    });

    it('should omit id when not set', () => {
      const domain = new TenantUser();
      domain.tenantId = 'tenant-uuid-2';
      domain.userId = 7;
      domain.isActive = true;

      const entity = TenantUserMapper.toPersistence(domain);

      expect(entity.id).toBeUndefined();
      expect(entity.tenant).toEqual({ id: 'tenant-uuid-2' });
      expect(entity.user).toEqual({ id: 7 });
    });
  });
});
