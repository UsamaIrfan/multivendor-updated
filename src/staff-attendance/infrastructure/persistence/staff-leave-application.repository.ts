import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { StaffLeaveApplication } from '../../domain/staff-leave-application';

export abstract class StaffLeaveApplicationRepository {
  abstract create(
    data: DeepPartial<StaffLeaveApplication>,
  ): Promise<StaffLeaveApplication>;

  abstract findAll(): Promise<StaffLeaveApplication[]>;

  abstract findById(id: number): Promise<NullableType<StaffLeaveApplication>>;

  abstract update(
    id: number,
    data: DeepPartial<StaffLeaveApplication>,
  ): Promise<StaffLeaveApplication | null>;

  abstract remove(id: number): Promise<void>;

  abstract findByStaffId(staffId: number): Promise<StaffLeaveApplication[]>;

  abstract findOverlapping(
    staffId: number,
    fromDate: Date,
    toDate: Date,
  ): Promise<StaffLeaveApplication[]>;
}
