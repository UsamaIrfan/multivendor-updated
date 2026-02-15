import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchExpenseEntity } from '../entities/branch-expense.entity';
import { BranchExpense } from '../../../../domain/branch-expense';
import {
  BranchExpenseRepository,
  BranchExpenseSummary,
  ExpenseReportOptions,
} from '../../branch-expense.repository';
import { BranchExpenseMapper } from '../mappers/branch-expense.mapper';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class BranchExpenseRelationalRepository
  implements BranchExpenseRepository
{
  constructor(
    @InjectRepository(BranchExpenseEntity)
    private readonly repo: Repository<BranchExpenseEntity>,
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

  async create(data: DeepPartial<BranchExpense>): Promise<BranchExpense> {
    const persistenceModel = this.repo.create(
      BranchExpenseMapper.toPersistence(data as BranchExpense),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return BranchExpenseMapper.toDomain(saved);
  }

  async findAll(): Promise<BranchExpense[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
      order: { date: 'DESC' },
    });
    return entities.map(BranchExpenseMapper.toDomain);
  }

  async findById(
    id: BranchExpense['id'],
  ): Promise<NullableType<BranchExpense>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? BranchExpenseMapper.toDomain(entity) : null;
  }

  async update(
    id: BranchExpense['id'],
    data: DeepPartial<BranchExpense>,
  ): Promise<BranchExpense | null> {
    const persistenceModel = BranchExpenseMapper.toPersistence(
      data as BranchExpense,
    );
    await this.repo.update(id, persistenceModel as any);
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? BranchExpenseMapper.toDomain(entity) : null;
  }

  async remove(id: BranchExpense['id']): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }

  async findByDateRange(
    options: ExpenseReportOptions,
  ): Promise<BranchExpense[]> {
    const qb = this.repo
      .createQueryBuilder('expense')
      .where('expense.tenantId = :tenantId', { tenantId: options.tenantId })
      .andWhere('expense.deletedAt IS NULL');

    if (options.branchId) {
      qb.andWhere('expense.branchId = :branchId', {
        branchId: options.branchId,
      });
    }

    if (options.startDate) {
      qb.andWhere('expense.date >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options.endDate) {
      qb.andWhere('expense.date <= :endDate', { endDate: options.endDate });
    }

    if (options.category) {
      qb.andWhere('expense.category = :category', {
        category: options.category,
      });
    }

    qb.orderBy('expense.date', 'DESC');

    const entities = await qb.getMany();
    return entities.map(BranchExpenseMapper.toDomain);
  }

  async getConsolidatedReport(
    options: ExpenseReportOptions,
  ): Promise<BranchExpenseSummary[]> {
    const qb = this.repo
      .createQueryBuilder('expense')
      .select('expense.branchId', 'branchId')
      .addSelect('SUM(expense.amount)', 'totalAmount')
      .addSelect('COUNT(expense.id)', 'count')
      .where('expense.tenantId = :tenantId', { tenantId: options.tenantId })
      .andWhere('expense.deletedAt IS NULL');

    if (options.startDate) {
      qb.andWhere('expense.date >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options.endDate) {
      qb.andWhere('expense.date <= :endDate', { endDate: options.endDate });
    }

    if (options.category) {
      qb.andWhere('expense.category = :category', {
        category: options.category,
      });
    }

    qb.groupBy('expense.branchId');

    const results = await qb.getRawMany();
    return results.map((r) => ({
      branchId: r.branchId,
      totalAmount: Number(r.totalAmount) || 0,
      count: Number(r.count) || 0,
    }));
  }

  async getTotalByTenant(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    const qb = this.repo
      .createQueryBuilder('expense')
      .select('COALESCE(SUM(expense.amount), 0)', 'total')
      .where('expense.tenantId = :tenantId', { tenantId })
      .andWhere('expense.deletedAt IS NULL');

    if (startDate) {
      qb.andWhere('expense.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('expense.date <= :endDate', { endDate });
    }

    const result = await qb.getRawOne();
    return Number(result?.total) || 0;
  }

  async getTotalByBranch(
    tenantId: string,
    branchId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    const qb = this.repo
      .createQueryBuilder('expense')
      .select('COALESCE(SUM(expense.amount), 0)', 'total')
      .where('expense.tenantId = :tenantId', { tenantId })
      .andWhere('expense.branchId = :branchId', { branchId })
      .andWhere('expense.deletedAt IS NULL');

    if (startDate) {
      qb.andWhere('expense.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('expense.date <= :endDate', { endDate });
    }

    const result = await qb.getRawOne();
    return Number(result?.total) || 0;
  }
}
