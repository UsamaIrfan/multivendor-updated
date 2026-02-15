import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { StaffBranchAssignment } from '../../domain/staff-branch-assignment';

export abstract class StaffBranchAssignmentRepository {
  abstract create(
    data: DeepPartial<StaffBranchAssignment>,
  ): Promise<StaffBranchAssignment>;
  abstract findAll(): Promise<StaffBranchAssignment[]>;
  abstract findById(id: number): Promise<NullableType<StaffBranchAssignment>>;
  abstract update(
    id: number,
    data: DeepPartial<StaffBranchAssignment>,
  ): Promise<StaffBranchAssignment | null>;
  abstract remove(id: number): Promise<void>;
  abstract findByStaffId(
    staffEntityId: number,
  ): Promise<StaffBranchAssignment[]>;
  abstract findByStaffAndBranch(
    staffEntityId: number,
    branchId: string,
  ): Promise<NullableType<StaffBranchAssignment>>;
  abstract updatePrimaryFlag(
    staffEntityId: number,
    branchId: string,
    isPrimary: boolean,
  ): Promise<void>;
  abstract findByUserAndTenant(
    userId: number,
    tenantId: string,
  ): Promise<StaffBranchAssignment[]>;
}
