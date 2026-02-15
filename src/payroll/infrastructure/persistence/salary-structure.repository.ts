import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { SalaryStructure } from '../../domain/salary-structure';

export abstract class SalaryStructureRepository {
  abstract create(data: DeepPartial<SalaryStructure>): Promise<SalaryStructure>;
  abstract findAll(): Promise<SalaryStructure[]>;
  abstract findById(
    id: SalaryStructure['id'],
  ): Promise<NullableType<SalaryStructure>>;
  abstract findByStaffId(
    staffId: number,
  ): Promise<NullableType<SalaryStructure>>;
  abstract findActiveByTenant(): Promise<SalaryStructure[]>;
  abstract update(
    id: SalaryStructure['id'],
    data: DeepPartial<SalaryStructure>,
  ): Promise<SalaryStructure | null>;
  abstract remove(id: SalaryStructure['id']): Promise<void>;
}
