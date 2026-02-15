import {
  SalaryStructure,
  SalaryComponent,
} from '../../../../domain/salary-structure';
import { SalaryStructureEntity } from '../entities/salary-structure.entity';

export class SalaryStructureMapper {
  static toDomain(entity: SalaryStructureEntity): SalaryStructure {
    const domain = new SalaryStructure();
    domain.id = entity.id;
    domain.staffId = entity.staffId;
    domain.name = entity.name;
    domain.components = (entity.components ?? []).map((c) => {
      const comp = new SalaryComponent();
      comp.name = c.name;
      comp.type = c.type;
      comp.amount = c.amount;
      return comp;
    });
    domain.totalEarnings = Number(entity.totalEarnings);
    domain.totalDeductions = Number(entity.totalDeductions);
    domain.netPay = Number(entity.netPay);
    domain.isActive = entity.isActive;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: SalaryStructure): SalaryStructureEntity {
    const entity = new SalaryStructureEntity();
    if (domain.id) entity.id = domain.id;
    entity.staffId = domain.staffId;
    entity.name = domain.name;
    entity.components = (domain.components ?? []).map((c) => ({
      name: c.name,
      type: c.type,
      amount: c.amount,
    }));
    entity.totalEarnings = domain.totalEarnings;
    entity.totalDeductions = domain.totalDeductions;
    entity.netPay = domain.netPay;
    entity.isActive = domain.isActive;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    return entity;
  }
}
