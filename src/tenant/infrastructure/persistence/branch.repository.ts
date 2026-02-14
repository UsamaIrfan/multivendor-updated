import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { Branch } from '../../domain/branch';

export abstract class BranchRepository {
  abstract create(data: DeepPartial<Branch>): Promise<Branch>;

  abstract findAllByTenant(tenantId: string): Promise<Branch[]>;

  abstract findById(id: string): Promise<NullableType<Branch>>;

  abstract update(
    id: string,
    payload: DeepPartial<Branch>,
  ): Promise<Branch | null>;

  abstract remove(id: string): Promise<void>;
}
