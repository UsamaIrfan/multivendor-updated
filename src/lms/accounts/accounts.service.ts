import { Injectable, NotFoundException } from '@nestjs/common';

import { IncomeRepository } from './infrastructure/persistence/income.repository';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

import { ExpenseRepository } from './infrastructure/persistence/expense.repository';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class AccountsService {
  constructor(
    private readonly incomeRepository: IncomeRepository,
    private readonly expenseRepository: ExpenseRepository,
  ) {}

  // ─── Income ───────────────────────────────────────────
  createIncome(dto: CreateIncomeDto) {
    return this.incomeRepository.create(dto);
  }

  findAllIncomes() {
    return this.incomeRepository.findAll();
  }

  async findOneIncome(id: number) {
    const income = await this.incomeRepository.findById(id);
    if (!income) throw new NotFoundException('Income not found');
    return income;
  }

  async updateIncome(id: number, dto: UpdateIncomeDto) {
    await this.findOneIncome(id);
    return this.incomeRepository.update(id, dto);
  }

  async removeIncome(id: number) {
    await this.findOneIncome(id);
    return this.incomeRepository.remove(id);
  }

  // ─── Expense ──────────────────────────────────────────
  createExpense(dto: CreateExpenseDto) {
    return this.expenseRepository.create(dto);
  }

  findAllExpenses() {
    return this.expenseRepository.findAll();
  }

  async findOneExpense(id: number) {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async updateExpense(id: number, dto: UpdateExpenseDto) {
    await this.findOneExpense(id);
    return this.expenseRepository.update(id, dto);
  }

  async removeExpense(id: number) {
    await this.findOneExpense(id);
    return this.expenseRepository.remove(id);
  }
}
