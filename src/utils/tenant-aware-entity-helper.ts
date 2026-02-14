import { Column, Index } from 'typeorm';
import { EntityRelationalHelper } from './relational-entity-helper';

/**
 * Base entity for all tenant-scoped entities.
 * Adds tenant_id (required) and branch_id (optional) columns
 * with indexes for efficient filtering.
 */
export class TenantAwareEntityHelper extends EntityRelationalHelper {
  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  branchId!: string | null;
}
