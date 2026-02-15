import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchIncomeEntity } from './entities/branch-income.entity';
import { BranchIncomeRepository } from '../branch-income.repository';
import { BranchIncomeRelationalRepository } from './repositories/branch-income.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BranchIncomeEntity])],
  providers: [
    {
      provide: BranchIncomeRepository,
      useClass: BranchIncomeRelationalRepository,
    },
  ],
  exports: [BranchIncomeRepository],
})
export class IncomeRelationalPersistenceModule {}
