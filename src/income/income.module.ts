import { Module } from '@nestjs/common';
import { IncomeRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { IncomeService } from './income.service';
import { IncomeController } from './income.controller';

@Module({
  imports: [IncomeRelationalPersistenceModule],
  controllers: [IncomeController],
  providers: [IncomeService],
  exports: [IncomeService],
})
export class IncomeModule {}
