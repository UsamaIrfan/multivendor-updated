import { Injectable, NotFoundException } from '@nestjs/common';
import { BranchExpenseRepository } from './infrastructure/persistence/branch-expense.repository';
import { TenantContextService } from '../tenant/tenant-context/tenant-context.service';
import { CreateBranchExpenseDto } from './dto/create-branch-expense.dto';
import { UpdateBranchExpenseDto } from './dto/update-branch-expense.dto';
import { ExpenseReportQueryDto } from './dto/expense-report-query.dto';
import { BranchExpense } from './domain/branch-expense';
import { DeepPartial } from '../utils/types/deep-partial.type';
import { ExpenseStatusEnum } from '../lms/common/enums/general.enum';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly expenseRepo: BranchExpenseRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(dto: CreateBranchExpenseDto): Promise<BranchExpense> {
    const data: DeepPartial<BranchExpense> = {
      category: dto.category,
      description: dto.description ?? null,
      amount: dto.amount,
      date: new Date(dto.date),
      referenceNumber: dto.referenceNumber ?? null,
      paidTo: dto.paidTo ?? null,
      status: dto.status ?? ExpenseStatusEnum.pending,
      remarks: dto.remarks ?? null,
      tenantId: dto.tenantId,
      branchId: dto.branchId ?? null,
    };
    return this.expenseRepo.create(data);
  }

  async findAll(): Promise<BranchExpense[]> {
    return this.expenseRepo.findAll();
  }

  async findById(id: string): Promise<BranchExpense> {
    const expense = await this.expenseRepo.findById(id);
    if (!expense) {
      throw new NotFoundException({
        status: 404,
        errors: { id: 'Expense record not found' },
      });
    }
    return expense;
  }

  async update(
    id: string,
    dto: UpdateBranchExpenseDto,
  ): Promise<BranchExpense> {
    const existing = await this.expenseRepo.findById(id);
    if (!existing) {
      throw new NotFoundException({
        status: 404,
        errors: { id: 'Expense record not found' },
      });
    }

    const data: DeepPartial<BranchExpense> = {};
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.referenceNumber !== undefined)
      data.referenceNumber = dto.referenceNumber;
    if (dto.paidTo !== undefined) data.paidTo = dto.paidTo;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.remarks !== undefined) data.remarks = dto.remarks;
    if (dto.branchId !== undefined) data.branchId = dto.branchId;

    const updated = await this.expenseRepo.update(id, data);
    if (!updated) {
      throw new NotFoundException({
        status: 404,
        errors: { id: 'Expense record not found after update' },
      });
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.expenseRepo.findById(id);
    if (!existing) {
      throw new NotFoundException({
        status: 404,
        errors: { id: 'Expense record not found' },
      });
    }
    await this.expenseRepo.remove(id);
  }

  async getExpenseReport(
    query: ExpenseReportQueryDto,
  ): Promise<BranchExpense[]> {
    const tenantId = this.tenantContext.getTenantId();
    return this.expenseRepo.findByDateRange({
      tenantId,
      startDate: query.startDate,
      endDate: query.endDate,
      branchId: query.branchId,
      category: query.category,
    });
  }

  async getConsolidatedReport(query: ExpenseReportQueryDto) {
    const tenantId = this.tenantContext.getTenantId();
    const summaries = await this.expenseRepo.getConsolidatedReport({
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
