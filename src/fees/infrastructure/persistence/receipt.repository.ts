import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { Receipt } from '../../domain/receipt';

export abstract class ReceiptRepository {
  abstract create(data: DeepPartial<Receipt>): Promise<Receipt>;
  abstract findAll(): Promise<Receipt[]>;
  abstract findById(id: number): Promise<NullableType<Receipt>>;
  abstract update(
    id: number,
    payload: DeepPartial<Receipt>,
  ): Promise<Receipt | null>;
  abstract remove(id: number): Promise<void>;
  abstract getNextReceiptNumber(): Promise<string>;
}
