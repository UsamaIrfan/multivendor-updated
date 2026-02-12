import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { CourseMaterial } from '../../domain/course-material';

export abstract class CourseMaterialRepository {
  abstract create(data: DeepPartial<CourseMaterial>): Promise<CourseMaterial>;
  abstract findAll(): Promise<CourseMaterial[]>;
  abstract findById(id: number): Promise<NullableType<CourseMaterial>>;
  abstract update(
    id: number,
    payload: DeepPartial<CourseMaterial>,
  ): Promise<CourseMaterial | null>;
  abstract remove(id: number): Promise<void>;
}
