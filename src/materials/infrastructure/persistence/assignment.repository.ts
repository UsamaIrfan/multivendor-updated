import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { Assignment } from '../../domain/assignment';

export abstract class AssignmentRepository {
  abstract create(data: DeepPartial<Assignment>): Promise<Assignment>;
  abstract findAll(): Promise<Assignment[]>;
  abstract findById(id: number): Promise<NullableType<Assignment>>;
  abstract update(
    id: number,
    payload: DeepPartial<Assignment>,
  ): Promise<Assignment | null>;
  abstract remove(id: number): Promise<void>;
}
