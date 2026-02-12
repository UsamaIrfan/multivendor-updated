import { FeeChallan } from '../../../../domain/fee-challan';
import { FeeChallanEntity } from '../entities/fee-challan.entity';

export class FeeChallanMapper {
  static toDomain(entity: FeeChallanEntity): FeeChallan {
    const domain = new FeeChallan();
    domain.id = entity.id;
    domain.studentId = entity.student?.id;
    domain.feeStructureId = entity.feeStructure?.id;
    domain.challanNumber = entity.challanNumber;
    domain.totalAmount = entity.totalAmount;
    domain.paidAmount = entity.paidAmount;
    domain.discount = entity.discount;
    domain.dueDate = entity.dueDate;
    domain.issueDate = entity.issueDate;
    domain.status = entity.status;
    domain.remarks = entity.remarks;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: FeeChallan): FeeChallanEntity {
    const entity = new FeeChallanEntity();
    if (domain.id) entity.id = domain.id;
    entity.challanNumber = domain.challanNumber;
    entity.totalAmount = domain.totalAmount;
    entity.paidAmount = domain.paidAmount;
    entity.discount = domain.discount;
    entity.dueDate = domain.dueDate;
    entity.issueDate = domain.issueDate;
    entity.status = domain.status;
    entity.remarks = domain.remarks;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;
    return entity;
  }
}
