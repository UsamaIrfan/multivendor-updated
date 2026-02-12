import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { Staff } from '../../domain/staff';

export abstract class StaffRepository {
  abstract create(data: DeepPartial<Staff>): Promise<Staff>;
  abstract findAll(): Promise<Staff[]>;
  abstract findById(id: Staff['id']): Promise<NullableType<Staff>>;
  abstract update(
    id: Staff['id'],
    data: DeepPartial<Staff>,
  ): Promise<Staff | null>;
  abstract remove(id: Staff['id']): Promise<void>;
}
