import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IncomeEntity } from './entities/income.entity';
import { ExpenseEntity } from './entities/expense.entity';

import { IncomeRepository } from '../income.repository';
import { IncomeRelationalRepository } from './repositories/income.repository';
import { ExpenseRepository } from '../expense.repository';
import { ExpenseRelationalRepository } from './repositories/expense.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeEntity, ExpenseEntity])],
  providers: [
    { provide: IncomeRepository, useClass: IncomeRelationalRepository },
    { provide: ExpenseRepository, useClass: ExpenseRelationalRepository },
  ],
  exports: [IncomeRepository, ExpenseRepository],
})
export class AccountsRelationalPersistenceModule {}
