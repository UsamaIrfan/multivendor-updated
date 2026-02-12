import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionEntity } from './entities/institution.entity';
import { DepartmentEntity } from './entities/department.entity';
import { GradeClassEntity } from './entities/grade-class.entity';
import { SectionEntity } from './entities/section.entity';
import { SubjectEntity } from './entities/subject.entity';
import { InstitutionRepository } from '../institution.repository';
import { InstitutionRelationalRepository } from './repositories/institution.repository';
import { DepartmentRepository } from '../department.repository';
import { DepartmentRelationalRepository } from './repositories/department.repository';
import { GradeClassRepository } from '../grade-class.repository';
import { GradeClassRelationalRepository } from './repositories/grade-class.repository';
import { SectionRepository } from '../section.repository';
import { SectionRelationalRepository } from './repositories/section.repository';
import { SubjectRepository } from '../subject.repository';
import { SubjectRelationalRepository } from './repositories/subject.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstitutionEntity,
      DepartmentEntity,
      GradeClassEntity,
      SectionEntity,
      SubjectEntity,
    ]),
  ],
  providers: [
    {
      provide: InstitutionRepository,
      useClass: InstitutionRelationalRepository,
    },
    {
      provide: DepartmentRepository,
      useClass: DepartmentRelationalRepository,
    },
    {
      provide: GradeClassRepository,
      useClass: GradeClassRelationalRepository,
    },
    {
      provide: SectionRepository,
      useClass: SectionRelationalRepository,
    },
    {
      provide: SubjectRepository,
      useClass: SubjectRelationalRepository,
    },
  ],
  exports: [
    InstitutionRepository,
    DepartmentRepository,
    GradeClassRepository,
    SectionRepository,
    SubjectRepository,
  ],
})
export class CoursesRelationalPersistenceModule {}
