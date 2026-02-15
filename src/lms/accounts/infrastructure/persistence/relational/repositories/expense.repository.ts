import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseEntity } from '../entities/expense.entity';
import { Expense } from '../../../../domain/expense';
import { ExpenseRepository } from '../../expense.repository';
import { ExpenseMapper } from '../mappers/expense.mapper';
import { DeepPartial } from '../../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class ExpenseRelationalRepository implements ExpenseRepository {
  constructor(
    @InjectRepository(ExpenseEntity)
    private readonly repo: Repository<ExpenseEntity>,
    private readonly tenantContext: TenantContextService,
  ) {}

  private getTenantFilter(): Record<string, unknown> {
    if (this.tenantContext.hasContext()) {
      const filter: Record<string, unknown> = {
        tenantId: this.tenantContext.getTenantId(),
      };
      const branchId = this.tenantContext.getBranchId();
      if (branchId) filter.branchId = branchId;
      return filter;
    }
    return {};
  }

  async create(data: DeepPartial<Expense>): Promise<Expense> {
    const entity = this.repo.create(data as any) as unknown as ExpenseEntity;
    if (this.tenantContext.hasContext()) {
      (entity as any).tenantId = this.tenantContext.getTenantId();
      (entity as any).branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(entity);
    return ExpenseMapper.toDomain(saved);
  }

  async findAll(): Promise<Expense[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(ExpenseMapper.toDomain);
  }

  async findById(id: Expense['id']): Promise<NullableType<Expense>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? ExpenseMapper.toDomain(entity) : null;
  }

  async update(
    id: Expense['id'],
    data: DeepPartial<Expense>,
  ): Promise<Expense | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? ExpenseMapper.toDomain(entity) : null;
  }

  async remove(id: Expense['id']): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
