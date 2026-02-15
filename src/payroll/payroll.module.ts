import { Module } from '@nestjs/common';
import { PayrollRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { PayrollService } from './payroll.service';
import {
  SalaryStructureController,
  PayrollController,
} from './payroll.controller';
import { TenantModule } from '../tenant/tenant.module';
import { AccountsModule } from '../lms/accounts/accounts.module';

@Module({
  imports: [PayrollRelationalPersistenceModule, TenantModule, AccountsModule],
  controllers: [SalaryStructureController, PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
