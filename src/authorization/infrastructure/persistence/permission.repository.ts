import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { Permission } from '../../domain/permission';

export abstract class PermissionRepository {
  abstract create(data: DeepPartial<Permission>): Promise<Permission>;

  abstract findAll(): Promise<Permission[]>;

  abstract findById(id: number): Promise<NullableType<Permission>>;

  abstract findByCode(code: string): Promise<NullableType<Permission>>;

  abstract findByDomain(domain: string): Promise<Permission[]>;

  abstract findByCodes(codes: string[]): Promise<Permission[]>;

  abstract update(
    id: number,
    payload: DeepPartial<Permission>,
  ): Promise<Permission | null>;

  abstract remove(id: number): Promise<void>;
}
