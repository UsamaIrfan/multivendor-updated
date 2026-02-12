import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { FeeStructure } from '../../domain/fee-structure';

export abstract class FeeStructureRepository {
  abstract create(data: DeepPartial<FeeStructure>): Promise<FeeStructure>;
  abstract findAll(): Promise<FeeStructure[]>;
  abstract findById(id: number): Promise<NullableType<FeeStructure>>;
  abstract update(
    id: number,
    payload: DeepPartial<FeeStructure>,
  ): Promise<FeeStructure | null>;
  abstract remove(id: number): Promise<void>;
}
