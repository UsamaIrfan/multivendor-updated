import { Module } from '@nestjs/common';
import { StaffRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { StaffService } from './staff.service';
import {
  StaffController,
  StaffAttendanceController,
  StaffLeaveController,
  NoticeController,
  TimetableSlotController,
  SalarySlipController,
} from './staff.controller';

@Module({
  imports: [StaffRelationalPersistenceModule],
  controllers: [
    StaffController,
    StaffAttendanceController,
    StaffLeaveController,
    NoticeController,
    TimetableSlotController,
    SalarySlipController,
  ],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
