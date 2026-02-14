import { FeePayment } from '../../../../domain/fee-payment';
import { FeePaymentEntity } from '../entities/fee-payment.entity';

export class FeePaymentMapper {
  static toDomain(entity: FeePaymentEntity): FeePayment {
    const domain = new FeePayment();
    domain.id = entity.id;
    domain.feeChallanId = entity.feeChallan?.id;
    domain.amount = entity.amount;
    domain.method = entity.method;
    domain.transactionRef = entity.transactionRef;
    domain.receiptNumber = entity.receiptNumber;
    domain.paidAt = entity.paidAt;
    domain.remarks = entity.remarks;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: FeePayment): FeePaymentEntity {
    const entity = new FeePaymentEntity();
    if (domain.id) entity.id = domain.id;
    entity.amount = domain.amount;
    entity.method = domain.method;
    entity.transactionRef = domain.transactionRef;
    entity.receiptNumber = domain.receiptNumber;
    entity.paidAt = domain.paidAt;
    entity.remarks = domain.remarks;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
