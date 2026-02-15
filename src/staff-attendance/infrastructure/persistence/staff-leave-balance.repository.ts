import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { StaffLeaveBalance } from '../../domain/staff-leave-balance';
import { LeaveTypeEnum } from '../../../lms/common/enums/leave-status.enum';

export abstract class StaffLeaveBalanceRepository {
  abstract create(
    data: DeepPartial<StaffLeaveBalance>,
  ): Promise<StaffLeaveBalance>;

  abstract findAll(): Promise<StaffLeaveBalance[]>;

  abstract findById(id: number): Promise<NullableType<StaffLeaveBalance>>;

  abstract update(
    id: number,
    data: DeepPartial<StaffLeaveBalance>,
  ): Promise<StaffLeaveBalance | null>;

  abstract remove(id: number): Promise<void>;

  abstract findByStaffAndType(
    staffId: number,
    leaveType: LeaveTypeEnum,
    year: number,
  ): Promise<NullableType<StaffLeaveBalance>>;

  abstract findByStaff(
    staffId: number,
    year?: number,
  ): Promise<StaffLeaveBalance[]>;

  abstract findByFilters(filters: {
    staffId?: number;
    leaveType?: LeaveTypeEnum;
    year?: number;
  }): Promise<StaffLeaveBalance[]>;
}
