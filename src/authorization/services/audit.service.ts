import { Injectable, Logger } from '@nestjs/common';
import { AuditLogRepository } from '../infrastructure/persistence/audit-log.repository';
import { AuditLog } from '../domain/audit-log';
import { DeepPartial } from '../../utils/types/deep-partial.type';

/**
 * Service for writing and querying audit log entries.
 * Write operations are fire-and-forget to avoid impacting request latency.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditLogRepo: AuditLogRepository) {}

  /**
   * Log an action asynchronously (fire-and-forget).
   * Failures are logged but never bubble up to the caller.
   */
  log(entry: DeepPartial<AuditLog>): void {
    this.auditLogRepo.create(entry).catch((err) => {
      this.logger.error(`Failed to write audit log: ${err.message}`, err.stack);
    });
  }

  /**
   * Query audit logs for a tenant with optional filters.
   */
  async findByTenant(
    tenantId: string,
    options?: {
      userId?: number;
      action?: string;
      resourceType?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<AuditLog[]> {
    return this.auditLogRepo.findByTenant(tenantId, options);
  }
}
