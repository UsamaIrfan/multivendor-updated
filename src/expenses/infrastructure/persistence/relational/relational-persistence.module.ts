import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchExpenseEntity } from './entities/branch-expense.entity';
import { BranchExpenseRepository } from '../branch-expense.repository';
import { BranchExpenseRelationalRepository } from './repositories/branch-expense.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BranchExpenseEntity])],
  providers: [
    {
      provide: BranchExpenseRepository,
      useClass: BranchExpenseRelationalRepository,
    },
  ],
  exports: [BranchExpenseRepository],
})
export class ExpenseRelationalPersistenceModule {}
