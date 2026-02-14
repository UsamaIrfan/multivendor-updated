import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { Concession } from '../../domain/concession';

export abstract class ConcessionRepository {
  abstract create(data: DeepPartial<Concession>): Promise<Concession>;
  abstract findAll(): Promise<Concession[]>;
  abstract findById(id: number): Promise<NullableType<Concession>>;
  abstract update(
    id: number,
    payload: DeepPartial<Concession>,
  ): Promise<Concession | null>;
  abstract remove(id: number): Promise<void>;
  abstract findActiveByStudentId(
    studentId: number,
    asOfDate?: Date,
  ): Promise<Concession[]>;
}
