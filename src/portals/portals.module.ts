import { Module } from '@nestjs/common';
import { TenantModule } from '../tenant/tenant.module';
import { StaffManagementRelationalPersistenceModule } from '../staff-management/infrastructure/persistence/relational/relational-persistence.module';
import { StudentRelationalPersistenceModule } from '../lms/student/infrastructure/persistence/relational/relational-persistence.module';
import { CoursesRelationalPersistenceModule } from '../lms/courses/infrastructure/persistence/relational/relational-persistence.module';
import { AcademicRelationalPersistenceModule } from '../lms/academic/infrastructure/persistence/relational/relational-persistence.module';
import { PortalsService } from './portals.service';
import { PortalsController } from './portals.controller';

@Module({
  imports: [
    TenantModule,
    StaffManagementRelationalPersistenceModule,
    StudentRelationalPersistenceModule,
    CoursesRelationalPersistenceModule,
    AcademicRelationalPersistenceModule,
  ],
  controllers: [PortalsController],
  providers: [PortalsService],
  exports: [PortalsService],
})
export class PortalsModule {}
