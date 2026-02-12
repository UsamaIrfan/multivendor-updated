import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { Institution } from '../../domain/institution';

export abstract class InstitutionRepository {
  abstract create(data: DeepPartial<Institution>): Promise<Institution>;

  abstract findAll(): Promise<Institution[]>;

  abstract findById(id: number): Promise<NullableType<Institution>>;

  abstract update(
    id: number,
    payload: DeepPartial<Institution>,
  ): Promise<Institution | null>;

  abstract remove(id: number): Promise<void>;
}
