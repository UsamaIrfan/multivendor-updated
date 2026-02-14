import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { FeeChallan } from '../../domain/fee-challan';

export abstract class FeeChallanRepository {
  abstract create(data: DeepPartial<FeeChallan>): Promise<FeeChallan>;
  abstract findAll(): Promise<FeeChallan[]>;
  abstract findById(id: number): Promise<NullableType<FeeChallan>>;
  abstract update(
    id: number,
    payload: DeepPartial<FeeChallan>,
  ): Promise<FeeChallan | null>;
  abstract remove(id: number): Promise<void>;

  // ── Extended methods for Fee Management ──
  abstract findByChallanNumber(
    challanNumber: string,
  ): Promise<NullableType<FeeChallan>>;
  abstract findByStudentId(studentId: number): Promise<FeeChallan[]>;
  abstract findByStudentAndStructureAndInstallment(
    studentId: number,
    feeStructureId: number,
    installmentIndex: number,
  ): Promise<NullableType<FeeChallan>>;
  abstract findPendingByClassId(classId: number): Promise<FeeChallan[]>;
  abstract getLastChallanNumberForYear(year: number): Promise<string | null>;
}
