import { Injectable, NotFoundException } from '@nestjs/common';
import { BranchIncomeRepository } from './infrastructure/persistence/branch-income.repository';
import { TenantContextService } from '../tenant/tenant-context/tenant-context.service';
import { CreateBranchIncomeDto } from './dto/create-branch-income.dto';
import { UpdateBranchIncomeDto } from './dto/update-branch-income.dto';
import { IncomeReportQueryDto } from './dto/income-report-query.dto';
import { BranchIncome } from './domain/branch-income';
import { DeepPartial } from '../utils/types/deep-partial.type';

@Injectable()
export class IncomeService {
  constructor(
    private readonly incomeRepo: BranchIncomeRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(dto: CreateBranchIncomeDto): Promise<BranchIncome> {
    const data: DeepPartial<BranchIncome> = {
      category: dto.category,
      description: dto.description ?? null,
      amount: dto.amount,
      date: new Date(dto.date),
      referenceNumber: dto.referenceNumber ?? null,
      receivedFrom: dto.receivedFrom ?? null,
      remarks: dto.remarks ?? null,
      tenantId: dto.tenantId,
      branchId: dto.branchId ?? null,
    };
    return this.incomeRepo.create(data);
  }

  async findAll(): Promise<BranchIncome[]> {
    return this.incomeRepo.findAll();
  }

  async findById(id: string): Promise<BranchIncome> {
    const income = await this.incomeRepo.findById(id);
    if (!income) {
      throw new NotFoundException({
        status: 404,
        errors: { id: 'Income record not found' },
      });
    }
    return income;
  }

  async update(id: string, dto: UpdateBranchIncomeDto): Promise<BranchIncome> {
    const existing = await this.incomeRepo.findById(id);
    if (!existing) {
      throw new NotFoundException({
        status: 404,
        errors: { id: 'Income record not found' },
      });
    }

    const data: DeepPartial<BranchIncome> = {};
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.referenceNumber !== undefined)
      data.referenceNumber = dto.referenceNumber;
    if (dto.receivedFrom !== undefined) data.receivedFrom = dto.receivedFrom;
    if (dto.remarks !== undefined) data.remarks = dto.remarks;
    if (dto.branchId !== undefined) data.branchId = dto.branchId;

    const updated = await this.incomeRepo.update(id, data);
    if (!updated) {
      throw new NotFoundException({
        status: 404,
        errors: { id: 'Income record not found after update' },
      });
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.incomeRepo.findById(id);
    if (!existing) {
      throw new NotFoundException({
        status: 404,
        errors: { id: 'Income record not found' },
      });
    }
    await this.incomeRepo.remove(id);
  }

  async getIncomeReport(query: IncomeReportQueryDto): Promise<BranchIncome[]> {
    const tenantId = this.tenantContext.getTenantId();
    return this.incomeRepo.findByDateRange({
      tenantId,
      startDate: query.startDate,
      endDate: query.endDate,
      branchId: query.branchId,
      category: query.category,
    });
  }

  async getConsolidatedReport(query: IncomeReportQueryDto) {
    const tenantId = this.tenantContext.getTenantId();
    const summaries = await this.incomeRepo.getConsolidatedReport({
      tenantId,
      startDate: query.startDate,
      endDate: query.endDate,
      category: query.category,
    });

    const grandTotal = summaries.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCount = summaries.reduce((sum, s) => sum + s.count, 0);

    return {
      tenantId,
      startDate: query.startDate ?? null,
      endDate: query.endDate ?? null,
      branches: summaries,
      grandTotal,
      totalCount,
    };
  }
}
