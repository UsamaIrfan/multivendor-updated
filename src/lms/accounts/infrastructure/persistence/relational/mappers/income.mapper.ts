import { Income } from '../../../../domain/income';
import { IncomeEntity } from '../entities/income.entity';

export class IncomeMapper {
  static toDomain(entity: IncomeEntity): Income {
    const domain = new Income();
    domain.id = entity.id;
    domain.institutionId = entity.institution?.id ?? 0;
    domain.feePaymentId = entity.feePayment?.id ?? null;
    domain.category = entity.category;
    domain.description = entity.description;
    domain.amount = entity.amount;
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

  static toPersistence(domain: Income): IncomeEntity {
    const entity = new IncomeEntity();
    if (domain.id) entity.id = domain.id;
    entity.institution = { id: domain.institutionId } as any;
    entity.feePayment = domain.feePaymentId
      ? ({ id: domain.feePaymentId } as any)
      : null;
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
