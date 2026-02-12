import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { Term } from '../../domain/term';

export abstract class TermRepository {
  abstract create(data: DeepPartial<Term>): Promise<Term>;

  abstract findAll(): Promise<Term[]>;

  abstract findById(id: number): Promise<NullableType<Term>>;

  abstract update(id: number, payload: DeepPartial<Term>): Promise<Term | null>;

  abstract remove(id: number): Promise<void>;
}
