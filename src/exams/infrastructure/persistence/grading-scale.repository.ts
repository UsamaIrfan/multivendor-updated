import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { GradingScale } from '../../domain/grading-scale';

export abstract class GradingScaleRepository {
  abstract create(data: DeepPartial<GradingScale>): Promise<GradingScale>;
  abstract findAll(): Promise<GradingScale[]>;
  abstract findById(id: number): Promise<NullableType<GradingScale>>;
  abstract findByName(name: string): Promise<NullableType<GradingScale>>;
  abstract update(
    id: number,
    payload: DeepPartial<GradingScale>,
  ): Promise<GradingScale | null>;
  abstract remove(id: number): Promise<void>;
}
