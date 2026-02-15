import { Module } from '@nestjs/common';
import { StaffAttendanceRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { StaffAttendanceService } from './staff-attendance.service';
import {
  StaffAttendanceCheckController,
  StaffLeaveController,
} from './staff-attendance.controller';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [StaffAttendanceRelationalPersistenceModule, TenantModule],
  controllers: [StaffAttendanceCheckController, StaffLeaveController],
  providers: [StaffAttendanceService],
  exports: [StaffAttendanceService],
})
export class StaffAttendanceModule {}
