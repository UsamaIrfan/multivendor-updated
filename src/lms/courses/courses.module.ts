import { Module } from '@nestjs/common';
import { CoursesRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { CoursesService } from './courses.service';
import {
  InstitutionController,
  DepartmentController,
  GradeClassController,
  SectionController,
  SubjectController,
} from './courses.controller';

@Module({
  imports: [CoursesRelationalPersistenceModule],
  controllers: [
    InstitutionController,
    DepartmentController,
    GradeClassController,
    SectionController,
    SubjectController,
  ],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
