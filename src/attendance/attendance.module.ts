import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceCalculatorService } from './attendance-calculator.service';
import { LeaveManagementService } from './leave-management.service';
import { StudentRelationalPersistenceModule } from '../lms/student/infrastructure/persistence/relational/relational-persistence.module';
import { StaffRelationalPersistenceModule } from '../lms/staff/infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    StudentRelationalPersistenceModule,
    StaffRelationalPersistenceModule,
  ],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceCalculatorService,
    LeaveManagementService,
  ],
  exports: [AttendanceService],
})
export class AttendanceModule {}
