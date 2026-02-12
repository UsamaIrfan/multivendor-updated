import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StaffEntity } from './entities/staff.entity';
import { StaffAttendanceEntity } from './entities/staff-attendance.entity';
import { StaffLeaveEntity } from './entities/staff-leave.entity';
import { NoticeEntity } from './entities/notice.entity';
import { TimetableSlotEntity } from './entities/timetable-slot.entity';
import { SalarySlipEntity } from './entities/salary-slip.entity';

import { StaffRepository } from '../staff.repository';
import { StaffRelationalRepository } from './repositories/staff.repository';
import { StaffAttendanceRepository } from '../staff-attendance.repository';
import { StaffAttendanceRelationalRepository } from './repositories/staff-attendance.repository';
import { StaffLeaveRepository } from '../staff-leave.repository';
import { StaffLeaveRelationalRepository } from './repositories/staff-leave.repository';
import { NoticeRepository } from '../notice.repository';
import { NoticeRelationalRepository } from './repositories/notice.repository';
import { TimetableSlotRepository } from '../timetable-slot.repository';
import { TimetableSlotRelationalRepository } from './repositories/timetable-slot.repository';
import { SalarySlipRepository } from '../salary-slip.repository';
import { SalarySlipRelationalRepository } from './repositories/salary-slip.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StaffEntity,
      StaffAttendanceEntity,
      StaffLeaveEntity,
      NoticeEntity,
      TimetableSlotEntity,
      SalarySlipEntity,
    ]),
  ],
  providers: [
    { provide: StaffRepository, useClass: StaffRelationalRepository },
    {
      provide: StaffAttendanceRepository,
      useClass: StaffAttendanceRelationalRepository,
    },
    {
      provide: StaffLeaveRepository,
      useClass: StaffLeaveRelationalRepository,
    },
    { provide: NoticeRepository, useClass: NoticeRelationalRepository },
    {
      provide: TimetableSlotRepository,
      useClass: TimetableSlotRelationalRepository,
    },
    {
      provide: SalarySlipRepository,
      useClass: SalarySlipRelationalRepository,
    },
  ],
  exports: [
    StaffRepository,
    StaffAttendanceRepository,
    StaffLeaveRepository,
    NoticeRepository,
    TimetableSlotRepository,
    SalarySlipRepository,
  ],
})
export class StaffRelationalPersistenceModule {}
