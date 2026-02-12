import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { FeeChallan } from '../../domain/fee-challan';

export abstract class FeeChallanRepository {
  abstract create(data: DeepPartial<FeeChallan>): Promise<FeeChallan>;
  abstract findAll(): Promise<FeeChallan[]>;
  abstract findById(id: number): Promise<NullableType<FeeChallan>>;
  abstract update(
    id: number,
    payload: DeepPartial<FeeChallan>,
  ): Promise<FeeChallan | null>;
  abstract remove(id: number): Promise<void>;
}
