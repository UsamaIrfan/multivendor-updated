import { Expense } from '../../../../domain/expense';
import { ExpenseEntity } from '../entities/expense.entity';

export class ExpenseMapper {
  static toDomain(entity: ExpenseEntity): Expense {
    const domain = new Expense();
    domain.id = entity.id;
    domain.institutionId = entity.institution?.id ?? 0;
    domain.salarySlipId = entity.salarySlip?.id ?? null;
    domain.category = entity.category;
    domain.description = entity.description;
    domain.amount = entity.amount;
    domain.date = entity.date;
    domain.referenceNumber = entity.referenceNumber;
    domain.paidTo = entity.paidTo;
    domain.status = entity.status;
    domain.remarks = entity.remarks;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Expense): ExpenseEntity {
    const entity = new ExpenseEntity();
    if (domain.id) entity.id = domain.id;
    entity.institution = { id: domain.institutionId } as any;
    entity.salarySlip = domain.salarySlipId
      ? ({ id: domain.salarySlipId } as any)
      : null;
    entity.category = domain.category;
    entity.description = domain.description;
    entity.amount = domain.amount;
    entity.date = domain.date;
    entity.referenceNumber = domain.referenceNumber;
    entity.paidTo = domain.paidTo;
    entity.status = domain.status;
    entity.remarks = domain.remarks;
    return entity;
  }
}
