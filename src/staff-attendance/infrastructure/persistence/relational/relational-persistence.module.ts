import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffAttendanceRecordEntity } from './entities/staff-attendance-record.entity';
import { StaffLeaveApplicationEntity } from './entities/staff-leave-application.entity';
import { StaffLeaveBalanceEntity } from './entities/staff-leave-balance.entity';
import { StaffAttendanceRecordRepository } from '../staff-attendance-record.repository';
import { StaffAttendanceRecordRelationalRepository } from './repositories/staff-attendance-record.repository';
import { StaffLeaveApplicationRepository } from '../staff-leave-application.repository';
import { StaffLeaveApplicationRelationalRepository } from './repositories/staff-leave-application.repository';
import { StaffLeaveBalanceRepository } from '../staff-leave-balance.repository';
import { StaffLeaveBalanceRelationalRepository } from './repositories/staff-leave-balance.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StaffAttendanceRecordEntity,
      StaffLeaveApplicationEntity,
      StaffLeaveBalanceEntity,
    ]),
  ],
  providers: [
    {
      provide: StaffAttendanceRecordRepository,
      useClass: StaffAttendanceRecordRelationalRepository,
    },
    {
      provide: StaffLeaveApplicationRepository,
      useClass: StaffLeaveApplicationRelationalRepository,
    },
    {
      provide: StaffLeaveBalanceRepository,
      useClass: StaffLeaveBalanceRelationalRepository,
    },
  ],
  exports: [
    StaffAttendanceRecordRepository,
    StaffLeaveApplicationRepository,
    StaffLeaveBalanceRepository,
  ],
})
export class StaffAttendanceRelationalPersistenceModule {}
