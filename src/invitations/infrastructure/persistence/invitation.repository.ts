import { Invitation, InvitationStatusEnum } from '../../domain/invitation';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';

export abstract class InvitationRepository {
  abstract create(
    data: DeepPartial<Invitation>,
  ): Promise<Invitation>;

  abstract findById(id: string): Promise<NullableType<Invitation>>;

  abstract findByEmail(
    email: string,
    tenantId: string,
  ): Promise<Invitation[]>;

  abstract findPendingByEmail(
    email: string,
    tenantId: string,
  ): Promise<NullableType<Invitation>>;

  abstract findAllByTenant(tenantId: string): Promise<Invitation[]>;

  abstract updateStatus(
    id: string,
    status: InvitationStatusEnum,
  ): Promise<void>;

  abstract remove(id: string): Promise<void>;
}
