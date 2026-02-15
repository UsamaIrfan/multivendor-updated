import { BranchExpense } from '../../../../domain/branch-expense';
import { BranchExpenseEntity } from '../entities/branch-expense.entity';

export class BranchExpenseMapper {
  static toDomain(entity: BranchExpenseEntity): BranchExpense {
    const domain = new BranchExpense();
    domain.id = entity.id;
    domain.category = entity.category;
    domain.description = entity.description;
    domain.amount = Number(entity.amount);
    domain.date = entity.date;
    domain.referenceNumber = entity.referenceNumber;
    domain.paidTo = entity.paidTo;
    domain.status = entity.status;
    domain.remarks = entity.remarks;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId!;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: BranchExpense): BranchExpenseEntity {
    const entity = new BranchExpenseEntity();
    if (domain.id) entity.id = domain.id;
    entity.category = domain.category;
    entity.description = domain.description;
    entity.amount = domain.amount;
    entity.date = domain.date;
    entity.referenceNumber = domain.referenceNumber;
    entity.paidTo = domain.paidTo;
    entity.status = domain.status;
    entity.remarks = domain.remarks;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    return entity;
  }
}
