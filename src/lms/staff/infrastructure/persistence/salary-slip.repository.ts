import { DeepPartial } from '../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../utils/types/nullable.type';
import { SalarySlip } from '../../domain/salary-slip';

export abstract class SalarySlipRepository {
  abstract create(data: DeepPartial<SalarySlip>): Promise<SalarySlip>;
  abstract findAll(): Promise<SalarySlip[]>;
  abstract findById(id: SalarySlip['id']): Promise<NullableType<SalarySlip>>;
  abstract update(
    id: SalarySlip['id'],
    data: DeepPartial<SalarySlip>,
  ): Promise<SalarySlip | null>;
  abstract remove(id: SalarySlip['id']): Promise<void>;
}
