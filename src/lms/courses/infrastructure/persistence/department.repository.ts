import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { Department } from '../../domain/department';

export abstract class DepartmentRepository {
  abstract create(data: DeepPartial<Department>): Promise<Department>;

  abstract findAll(): Promise<Department[]>;

  abstract findById(id: number): Promise<NullableType<Department>>;

  abstract update(
    id: number,
    payload: DeepPartial<Department>,
  ): Promise<Department | null>;

  abstract remove(id: number): Promise<void>;
}
