import { BranchIncome } from '../../../../domain/branch-income';
import { BranchIncomeEntity } from '../entities/branch-income.entity';

export class BranchIncomeMapper {
  static toDomain(entity: BranchIncomeEntity): BranchIncome {
    const domain = new BranchIncome();
    domain.id = entity.id;
    domain.category = entity.category;
    domain.description = entity.description;
    domain.amount = Number(entity.amount);
    domain.date = entity.date;
    domain.referenceNumber = entity.referenceNumber;
    domain.receivedFrom = entity.receivedFrom;
    domain.remarks = entity.remarks;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: BranchIncome): BranchIncomeEntity {
    const entity = new BranchIncomeEntity();
    if (domain.id) entity.id = domain.id;
    entity.category = domain.category;
    entity.description = domain.description;
    entity.amount = domain.amount;
    entity.date = domain.date;
    entity.referenceNumber = domain.referenceNumber;
    entity.receivedFrom = domain.receivedFrom;
    entity.remarks = domain.remarks;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    return entity;
  }
}
