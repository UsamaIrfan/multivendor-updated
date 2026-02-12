import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { Income } from '../../domain/income';

export abstract class IncomeRepository {
  abstract create(data: DeepPartial<Income>): Promise<Income>;
  abstract findAll(): Promise<Income[]>;
  abstract findById(id: Income['id']): Promise<NullableType<Income>>;
  abstract update(
    id: Income['id'],
    data: DeepPartial<Income>,
  ): Promise<Income | null>;
  abstract remove(id: Income['id']): Promise<void>;
}
