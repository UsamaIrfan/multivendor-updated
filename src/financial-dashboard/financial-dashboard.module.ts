import { Module } from '@nestjs/common';
import { IncomeRelationalPersistenceModule } from '../income/infrastructure/persistence/relational/relational-persistence.module';
import { ExpenseRelationalPersistenceModule } from '../expenses/infrastructure/persistence/relational/relational-persistence.module';
import { TenantModule } from '../tenant/tenant.module';
import { FinancialDashboardService } from './financial-dashboard.service';
import { FinancialDashboardController } from './financial-dashboard.controller';

@Module({
  imports: [
    IncomeRelationalPersistenceModule,
    ExpenseRelationalPersistenceModule,
    TenantModule,
  ],
  controllers: [FinancialDashboardController],
  providers: [FinancialDashboardService],
  exports: [FinancialDashboardService],
})
export class FinancialDashboardModule {}
