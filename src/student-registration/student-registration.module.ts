import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentRegistrationController } from './student-registration.controller';
import { StudentRegistrationService } from './student-registration.service';
import { StudentIdGeneratorService } from './student-id-generator.service';
import { StudentImportService } from './student-import.service';
import { StudentOwnershipGuard } from './guards/student-ownership.guard';
import { StudentRelationalPersistenceModule } from '../lms/student/infrastructure/persistence/relational/relational-persistence.module';
import { CoursesRelationalPersistenceModule } from '../lms/courses/infrastructure/persistence/relational/relational-persistence.module';
import { UsersModule } from '../users/users.module';
import { TenantModule } from '../tenant/tenant.module';
import { StudentGuardianEntity } from './infrastructure/persistence/relational/entities/student-guardian.entity';
import { StudentGuardianRepository } from './infrastructure/persistence/student-guardian.repository';
import { StudentGuardianRelationalRepository } from './infrastructure/persistence/relational/repositories/student-guardian.repository';
import { StudentEntity } from '../lms/student/infrastructure/persistence/relational/entities/student.entity';

@Module({
  imports: [
    StudentRelationalPersistenceModule,
    CoursesRelationalPersistenceModule,
    UsersModule,
    TenantModule,
    TypeOrmModule.forFeature([StudentGuardianEntity, StudentEntity]),
  ],
  controllers: [StudentRegistrationController],
  providers: [
    StudentRegistrationService,
    StudentIdGeneratorService,
    StudentImportService,
    StudentOwnershipGuard,
    {
      provide: StudentGuardianRepository,
      useClass: StudentGuardianRelationalRepository,
    },
  ],
  exports: [StudentRegistrationService],
})
export class StudentRegistrationModule {}
