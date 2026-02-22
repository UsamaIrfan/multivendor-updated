import { ConcessionEntity } from '../entities/concession.entity';
import { Concession } from '../../../../domain/concession';

export class ConcessionMapper {
  static toDomain(entity: ConcessionEntity): Concession {
    const domain = new Concession();
    domain.id = entity.id;
    domain.studentId = entity.student?.id ?? (entity as any).studentId;
    domain.type = entity.type;
    domain.discountPercentage = Number(entity.discountPercentage);
    domain.validFrom = entity.validFrom;
    domain.validTo = entity.validTo;
    domain.reason = entity.reason;
    domain.approved = entity.approved;
    domain.approvedBy = entity.approvedBy;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: Concession): Partial<ConcessionEntity> {
    const entity: Partial<ConcessionEntity> = {};
    if (domain.id) entity.id = domain.id;
    entity.student = { id: domain.studentId } as any;
    entity.type = domain.type;
    entity.discountPercentage = domain.discountPercentage;
    entity.validFrom = domain.validFrom;
    entity.validTo = domain.validTo;
    entity.reason = domain.reason;
    entity.approved = domain.approved;
    entity.approvedBy = domain.approvedBy;
    if (domain.tenantId !== undefined) entity.tenantId = domain.tenantId;
    if (domain.branchId !== undefined) entity.branchId = domain.branchId;
    return entity;
  }
}
