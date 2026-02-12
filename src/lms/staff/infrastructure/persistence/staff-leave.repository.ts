import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { StaffLeave } from '../../domain/staff-leave';

export abstract class StaffLeaveRepository {
  abstract create(data: DeepPartial<StaffLeave>): Promise<StaffLeave>;
  abstract findAll(): Promise<StaffLeave[]>;
  abstract findById(id: StaffLeave['id']): Promise<NullableType<StaffLeave>>;
  abstract update(
    id: StaffLeave['id'],
    data: DeepPartial<StaffLeave>,
  ): Promise<StaffLeave | null>;
  abstract remove(id: StaffLeave['id']): Promise<void>;
}
