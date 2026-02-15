import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { StaffMgmt } from '../../domain/staff-mgmt';

export abstract class StaffMgmtRepository {
  abstract create(data: DeepPartial<StaffMgmt>): Promise<StaffMgmt>;
  abstract findAll(): Promise<StaffMgmt[]>;
  abstract findById(id: number): Promise<NullableType<StaffMgmt>>;
  abstract findByIdWithAssignments(
    id: number,
  ): Promise<NullableType<StaffMgmt>>;
  abstract update(
    id: number,
    data: DeepPartial<StaffMgmt>,
  ): Promise<StaffMgmt | null>;
  abstract remove(id: number): Promise<void>;
  abstract findLastByStaffIdPrefix(
    prefix: string,
  ): Promise<NullableType<Pick<StaffMgmt, 'staffId'>>>;
  abstract findByBranch(branchId: string): Promise<StaffMgmt[]>;
  abstract findByUserId(userId: number): Promise<NullableType<StaffMgmt>>;
}
