import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetableEntity } from './entities/timetable.entity';
import { PeriodEntity } from './entities/period.entity';
import { TimetableRepository } from '../timetable.repository';
import { TimetableRelationalRepository } from './repositories/timetable.repository';
import { PeriodRepository } from '../period.repository';
import { PeriodRelationalRepository } from './repositories/period.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TimetableEntity, PeriodEntity])],
  providers: [
    {
      provide: TimetableRepository,
      useClass: TimetableRelationalRepository,
    },
    {
      provide: PeriodRepository,
      useClass: PeriodRelationalRepository,
    },
  ],
  exports: [TimetableRepository, PeriodRepository],
})
export class TimetablesRelationalPersistenceModule {}
