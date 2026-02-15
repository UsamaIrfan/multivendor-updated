import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { TenantContextService } from '../tenant/tenant-context/tenant-context.service';

/**
 * Base class for repositories that need automatic tenant/branch filtering.
 * Wraps a TypeORM repository and injects WHERE tenant_id = :tenantId
 * on all find operations.
 */
export class TenantAwareRepository<
  Entity extends { tenantId: string; branchId: string | null },
> {
  constructor(
    protected readonly repo: Repository<Entity>,
    protected readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Apply tenant (and optional branch) filtering to where conditions.
   */
  protected applyTenantFilter(
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[] {
    const tenantId = this.tenantContext.getTenantId();
    const branchId = this.tenantContext.getBranchId();

    const tenantFilter: Partial<Entity> = { tenantId } as any;
    if (branchId) {
      (tenantFilter as any).branchId = branchId;
    }

    if (Array.isArray(where)) {
      return where.map((w) => ({ ...w, ...tenantFilter }));
    }

    return { ...where, ...tenantFilter } as FindOptionsWhere<Entity>;
  }

  /**
   * Find all entities scoped to the current tenant.
   */
  async findAllTenantScoped(
    options?: FindManyOptions<Entity>,
  ): Promise<Entity[]> {
    return this.repo.find({
      ...options,
      where: this.applyTenantFilter(options?.where as FindOptionsWhere<Entity>),
    });
  }

  /**
   * Find one entity scoped to the current tenant.
   */
  async findOneTenantScoped(
    options: FindOneOptions<Entity>,
  ): Promise<Entity | null> {
    return this.repo.findOne({
      ...options,
      where: this.applyTenantFilter(options.where as FindOptionsWhere<Entity>),
    });
  }

  /**
   * Stamp tenant_id and branch_id on a new entity before saving.
   */
  protected stampTenantFields(entity: Partial<Entity>): void {
    const tenantId = this.tenantContext.getTenantId();
    const branchId = this.tenantContext.getBranchId();
    (entity as any).tenantId = tenantId;
    if (branchId) {
      (entity as any).branchId = branchId;
    }
  }

  /**
   * Save with automatic tenant stamping.
   */
  async saveTenantScoped(entity: Entity): Promise<Entity> {
    this.stampTenantFields(entity);
    return this.repo.save(entity);
  }
}
