import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { GradeClass } from '../../domain/grade-class';

export abstract class GradeClassRepository {
  abstract create(data: DeepPartial<GradeClass>): Promise<GradeClass>;

  abstract findAll(): Promise<GradeClass[]>;

  abstract findById(id: number): Promise<NullableType<GradeClass>>;

  abstract update(
    id: number,
    payload: DeepPartial<GradeClass>,
  ): Promise<GradeClass | null>;

  abstract remove(id: number): Promise<void>;
}
