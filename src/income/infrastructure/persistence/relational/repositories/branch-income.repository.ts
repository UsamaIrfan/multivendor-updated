import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchIncomeEntity } from '../entities/branch-income.entity';
import { BranchIncome } from '../../../../domain/branch-income';
import {
  BranchIncomeRepository,
  BranchIncomeSummary,
  IncomeReportOptions,
} from '../../branch-income.repository';
import { BranchIncomeMapper } from '../mappers/branch-income.mapper';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class BranchIncomeRelationalRepository
  implements BranchIncomeRepository
{
  constructor(
    @InjectRepository(BranchIncomeEntity)
    private readonly repo: Repository<BranchIncomeEntity>,
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

  async create(data: DeepPartial<BranchIncome>): Promise<BranchIncome> {
    const persistenceModel = this.repo.create(
      BranchIncomeMapper.toPersistence(data as BranchIncome),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return BranchIncomeMapper.toDomain(saved);
  }

  async findAll(): Promise<BranchIncome[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
      order: { date: 'DESC' },
    });
    return entities.map(BranchIncomeMapper.toDomain);
  }

  async findById(id: BranchIncome['id']): Promise<NullableType<BranchIncome>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? BranchIncomeMapper.toDomain(entity) : null;
  }

  async update(
    id: BranchIncome['id'],
    data: DeepPartial<BranchIncome>,
  ): Promise<BranchIncome | null> {
    const persistenceModel = BranchIncomeMapper.toPersistence(
      data as BranchIncome,
    );
    await this.repo.update(id, persistenceModel as any);
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? BranchIncomeMapper.toDomain(entity) : null;
  }

  async remove(id: BranchIncome['id']): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }

  async findByDateRange(options: IncomeReportOptions): Promise<BranchIncome[]> {
    const qb = this.repo
      .createQueryBuilder('income')
      .where('income.tenantId = :tenantId', { tenantId: options.tenantId })
      .andWhere('income.deletedAt IS NULL');

    if (options.branchId) {
      qb.andWhere('income.branchId = :branchId', {
        branchId: options.branchId,
      });
    }

    if (options.startDate) {
      qb.andWhere('income.date >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options.endDate) {
      qb.andWhere('income.date <= :endDate', { endDate: options.endDate });
    }

    if (options.category) {
      qb.andWhere('income.category = :category', {
        category: options.category,
      });
    }

    qb.orderBy('income.date', 'DESC');

    const entities = await qb.getMany();
    return entities.map(BranchIncomeMapper.toDomain);
  }

  async getConsolidatedReport(
    options: IncomeReportOptions,
  ): Promise<BranchIncomeSummary[]> {
    const qb = this.repo
      .createQueryBuilder('income')
      .select('income.branchId', 'branchId')
      .addSelect('SUM(income.amount)', 'totalAmount')
      .addSelect('COUNT(income.id)', 'count')
      .where('income.tenantId = :tenantId', { tenantId: options.tenantId })
      .andWhere('income.deletedAt IS NULL');

    if (options.startDate) {
      qb.andWhere('income.date >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options.endDate) {
      qb.andWhere('income.date <= :endDate', { endDate: options.endDate });
    }

    if (options.category) {
      qb.andWhere('income.category = :category', {
        category: options.category,
      });
    }

    qb.groupBy('income.branchId');

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
      .createQueryBuilder('income')
      .select('COALESCE(SUM(income.amount), 0)', 'total')
      .where('income.tenantId = :tenantId', { tenantId })
      .andWhere('income.deletedAt IS NULL');

    if (startDate) {
      qb.andWhere('income.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('income.date <= :endDate', { endDate });
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
      .createQueryBuilder('income')
      .select('COALESCE(SUM(income.amount), 0)', 'total')
      .where('income.tenantId = :tenantId', { tenantId })
      .andWhere('income.branchId = :branchId', { branchId })
      .andWhere('income.deletedAt IS NULL');

    if (startDate) {
      qb.andWhere('income.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('income.date <= :endDate', { endDate });
    }

    const result = await qb.getRawOne();
    return Number(result?.total) || 0;
  }
}
