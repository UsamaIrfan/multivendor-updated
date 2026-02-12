import { Module } from '@nestjs/common';
import { CoursesModule } from './courses/courses.module';
import { AcademicModule } from './academic/academic.module';
import { StudentModule } from './student/student.module';
import { StaffModule } from './staff/staff.module';
import { AccountsModule } from './accounts/accounts.module';

@Module({
  imports: [
    CoursesModule,
    AcademicModule,
    StudentModule,
    StaffModule,
    AccountsModule,
  ],
  exports: [
    CoursesModule,
    AcademicModule,
    StudentModule,
    StaffModule,
    AccountsModule,
  ],
})
export class LmsModule {}
