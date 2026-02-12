import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { Expense } from '../../domain/expense';

export abstract class ExpenseRepository {
  abstract create(data: DeepPartial<Expense>): Promise<Expense>;
  abstract findAll(): Promise<Expense[]>;
  abstract findById(id: Expense['id']): Promise<NullableType<Expense>>;
  abstract update(
    id: Expense['id'],
    data: DeepPartial<Expense>,
  ): Promise<Expense | null>;
  abstract remove(id: Expense['id']): Promise<void>;
}
