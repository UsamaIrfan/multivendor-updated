import { ReceiptEntity } from '../entities/receipt.entity';
import { Receipt } from '../../../../domain/receipt';

export class ReceiptMapper {
  static toDomain(entity: ReceiptEntity): Receipt {
    const domain = new Receipt();
    domain.id = entity.id;
    domain.paymentId = entity.payment?.id ?? (entity as any).paymentId;
    domain.receiptNumber = entity.receiptNumber;
    domain.amount = Number(entity.amount);
    domain.studentName = entity.studentName;
    domain.challanNumber = entity.challanNumber;
    domain.paymentMethod = entity.paymentMethod;
    domain.issuedAt = entity.issuedAt;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Receipt): Partial<ReceiptEntity> {
    const entity: Partial<ReceiptEntity> = {};
    if (domain.id) entity.id = domain.id;
    entity.payment = { id: domain.paymentId } as any;
    entity.receiptNumber = domain.receiptNumber;
    entity.amount = domain.amount;
    entity.studentName = domain.studentName;
    entity.challanNumber = domain.challanNumber;
    entity.paymentMethod = domain.paymentMethod;
    entity.issuedAt = domain.issuedAt;
    entity.tenantId = domain.tenantId;
    entity.branchId = domain.branchId;
    return entity;
  }
}
