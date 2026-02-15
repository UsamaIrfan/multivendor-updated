import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryStructureEntity } from './entities/salary-structure.entity';
import { PayrollSlipEntity } from './entities/payroll-slip.entity';
import { SalaryStructureRepository } from '../salary-structure.repository';
import { SalaryStructureRelationalRepository } from './repositories/salary-structure.repository';
import { PayrollSlipRepository } from '../payroll-slip.repository';
import { PayrollSlipRelationalRepository } from './repositories/payroll-slip.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalaryStructureEntity, PayrollSlipEntity]),
  ],
  providers: [
    {
      provide: SalaryStructureRepository,
      useClass: SalaryStructureRelationalRepository,
    },
    {
      provide: PayrollSlipRepository,
      useClass: PayrollSlipRelationalRepository,
    },
  ],
  exports: [SalaryStructureRepository, PayrollSlipRepository],
})
export class PayrollRelationalPersistenceModule {}
