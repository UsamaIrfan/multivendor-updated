import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { AuditLog } from '../../domain/audit-log';

export abstract class AuditLogRepository {
  abstract create(data: DeepPartial<AuditLog>): Promise<AuditLog>;

  abstract findByTenant(
    tenantId: string,
    options?: {
      userId?: number;
      action?: string;
      resourceType?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<AuditLog[]>;
}
