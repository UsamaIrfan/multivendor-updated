import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { Section } from '../../domain/section';

export abstract class SectionRepository {
  abstract create(data: DeepPartial<Section>): Promise<Section>;

  abstract findAll(): Promise<Section[]>;

  abstract findById(id: number): Promise<NullableType<Section>>;

  abstract update(
    id: number,
    payload: DeepPartial<Section>,
  ): Promise<Section | null>;

  abstract remove(id: number): Promise<void>;
}
