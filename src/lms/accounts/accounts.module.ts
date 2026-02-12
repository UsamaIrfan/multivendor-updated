import { Module } from '@nestjs/common';
import { AccountsRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AccountsService } from './accounts.service';
import { IncomeController, ExpenseController } from './accounts.controller';

@Module({
  imports: [AccountsRelationalPersistenceModule],
  controllers: [IncomeController, ExpenseController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
