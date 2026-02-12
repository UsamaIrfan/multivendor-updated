import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { AcademicYear } from '../../domain/academic-year';

export abstract class AcademicYearRepository {
  abstract create(data: DeepPartial<AcademicYear>): Promise<AcademicYear>;

  abstract findAll(): Promise<AcademicYear[]>;

  abstract findById(id: number): Promise<NullableType<AcademicYear>>;

  abstract update(
    id: number,
    payload: DeepPartial<AcademicYear>,
  ): Promise<AcademicYear | null>;

  abstract remove(id: number): Promise<void>;
}
