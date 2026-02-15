import { Module } from '@nestjs/common';
import { ExpenseRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';

@Module({
  imports: [ExpenseRelationalPersistenceModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
