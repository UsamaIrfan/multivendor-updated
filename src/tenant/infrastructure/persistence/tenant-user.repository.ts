import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { TenantUser } from '../../domain/tenant-user';

export abstract class TenantUserRepository {
  abstract create(data: DeepPartial<TenantUser>): Promise<TenantUser>;

  abstract findByTenantAndUser(
    tenantId: string,
    userId: number,
  ): Promise<NullableType<TenantUser>>;

  abstract findAllByUser(userId: number): Promise<TenantUser[]>;

  abstract findAllByTenant(tenantId: string): Promise<TenantUser[]>;

  abstract remove(id: string): Promise<void>;
}
