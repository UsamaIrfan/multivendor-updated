import { Module } from '@nestjs/common';
import { TimetablesRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { StaffManagementRelationalPersistenceModule } from '../staff-management/infrastructure/persistence/relational/relational-persistence.module';
import { TimetablesService } from './timetables.service';
import { TimetablesController } from './timetables.controller';

@Module({
  imports: [
    TimetablesRelationalPersistenceModule,
    StaffManagementRelationalPersistenceModule,
  ],
  controllers: [TimetablesController],
  providers: [TimetablesService],
  exports: [TimetablesService],
})
export class TimetablesModule {}
