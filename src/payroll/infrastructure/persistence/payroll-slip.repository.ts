import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { PayrollSlip } from '../../domain/payroll-slip';

export abstract class PayrollSlipRepository {
  abstract create(data: DeepPartial<PayrollSlip>): Promise<PayrollSlip>;
  abstract findAll(): Promise<PayrollSlip[]>;
  abstract findById(id: PayrollSlip['id']): Promise<NullableType<PayrollSlip>>;
  abstract findByStaffAndMonth(
    staffId: number,
    month: number,
    year: number,
  ): Promise<NullableType<PayrollSlip>>;
  abstract findByMonth(month: number, year: number): Promise<PayrollSlip[]>;
  abstract update(
    id: PayrollSlip['id'],
    data: DeepPartial<PayrollSlip>,
  ): Promise<PayrollSlip | null>;
  abstract remove(id: PayrollSlip['id']): Promise<void>;
}
