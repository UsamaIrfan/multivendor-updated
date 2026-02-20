import { Invitation, InvitationStatusEnum } from '../../../../domain/invitation';
import { InvitationEntity } from '../entities/invitation.entity';

export class InvitationMapper {
  static toDomain(entity: InvitationEntity): Invitation {
    const domain = new Invitation();
    domain.id = entity.id;
    domain.tenantId = entity.tenantId;
    domain.branchId = entity.branchId;
    domain.email = entity.email;
    domain.roleId = entity.roleId;
    domain.status = entity.status;
    domain.invitedBy = entity.invitedBy;
    domain.tenantName = entity.tenant?.name ?? undefined;
    domain.expiresAt = entity.expiresAt;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(
    domain: Partial<Invitation>,
  ): Partial<InvitationEntity> {
    const entity: Partial<InvitationEntity> = {};
    if (domain.id !== undefined) entity.id = domain.id;
    if (domain.tenantId !== undefined) {
      entity.tenantId = domain.tenantId;
      entity.tenant = { id: domain.tenantId } as any;
    }
    if (domain.branchId !== undefined) entity.branchId = domain.branchId;
    if (domain.email !== undefined) entity.email = domain.email;
    if (domain.roleId !== undefined) entity.roleId = domain.roleId;
    if (domain.status !== undefined) entity.status = domain.status;
    if (domain.invitedBy !== undefined) entity.invitedBy = domain.invitedBy;
    if (domain.expiresAt !== undefined) entity.expiresAt = domain.expiresAt;
    return entity;
  }
}
