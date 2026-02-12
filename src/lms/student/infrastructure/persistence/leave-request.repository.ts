import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { LeaveRequest } from '../../domain/leave-request';

export abstract class LeaveRequestRepository {
  abstract create(data: DeepPartial<LeaveRequest>): Promise<LeaveRequest>;
  abstract findAll(): Promise<LeaveRequest[]>;
  abstract findById(id: number): Promise<NullableType<LeaveRequest>>;
  abstract update(
    id: number,
    payload: DeepPartial<LeaveRequest>,
  ): Promise<LeaveRequest | null>;
  abstract remove(id: number): Promise<void>;
}
