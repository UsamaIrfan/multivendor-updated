import { SalarySlip } from '../../../../domain/salary-slip';
import { SalarySlipEntity } from '../entities/salary-slip.entity';

export class SalarySlipMapper {
  static toDomain(entity: SalarySlipEntity): SalarySlip {
    const domain = new SalarySlip();
    domain.id = entity.id;
    domain.staffId = entity.staff?.id ?? 0;
    domain.month = entity.month;
    domain.year = entity.year;
    domain.basicSalary = entity.basicSalary;
    domain.allowances = entity.allowances;
    domain.deductions = entity.deductions;
    domain.netSalary = entity.netSalary;
    domain.workingDays = entity.workingDays;
    domain.presentDays = entity.presentDays;
    domain.status = entity.status;
    domain.paidAt = entity.paidAt;
    domain.remarks = entity.remarks;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: SalarySlip): SalarySlipEntity {
    const entity = new SalarySlipEntity();
    if (domain.id) entity.id = domain.id;
    entity.staff = { id: domain.staffId } as any;
    entity.month = domain.month;
    entity.year = domain.year;
    entity.basicSalary = domain.basicSalary;
    entity.allowances = domain.allowances;
    entity.deductions = domain.deductions;
    entity.netSalary = domain.netSalary;
    entity.workingDays = domain.workingDays;
    entity.presentDays = domain.presentDays;
    entity.status = domain.status;
    entity.paidAt = domain.paidAt;
    entity.remarks = domain.remarks;
    return entity;
  }
}
