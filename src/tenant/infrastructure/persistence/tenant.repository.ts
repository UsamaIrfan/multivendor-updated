import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { Tenant } from '../../domain/tenant';

export abstract class TenantRepository {
  abstract create(data: DeepPartial<Tenant>): Promise<Tenant>;

  abstract findAll(): Promise<Tenant[]>;

  abstract findById(id: string): Promise<NullableType<Tenant>>;

  abstract findBySlug(slug: string): Promise<NullableType<Tenant>>;

  abstract update(
    id: string,
    payload: DeepPartial<Tenant>,
  ): Promise<Tenant | null>;

  abstract remove(id: string): Promise<void>;
}
