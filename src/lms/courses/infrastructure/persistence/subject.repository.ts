import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { Subject } from '../../domain/subject';

export abstract class SubjectRepository {
  abstract create(data: DeepPartial<Subject>): Promise<Subject>;

  abstract findAll(): Promise<Subject[]>;

  abstract findById(id: number): Promise<NullableType<Subject>>;

  abstract update(
    id: number,
    payload: DeepPartial<Subject>,
  ): Promise<Subject | null>;

  abstract remove(id: number): Promise<void>;
}
