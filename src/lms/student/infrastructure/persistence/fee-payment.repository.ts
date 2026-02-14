import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { FeePayment } from '../../domain/fee-payment';

export abstract class FeePaymentRepository {
  abstract create(data: DeepPartial<FeePayment>): Promise<FeePayment>;
  abstract findAll(): Promise<FeePayment[]>;
  abstract findById(id: number): Promise<NullableType<FeePayment>>;
  abstract update(
    id: number,
    payload: DeepPartial<FeePayment>,
  ): Promise<FeePayment | null>;
  abstract remove(id: number): Promise<void>;

  // ── Extended methods for Fee Management ──
  abstract findByChallanId(challanId: number): Promise<FeePayment[]>;
}
