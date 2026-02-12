import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearEntity } from './entities/academic-year.entity';
import { TermEntity } from './entities/term.entity';
import { AcademicYearRepository } from '../academic-year.repository';
import { AcademicYearRelationalRepository } from './repositories/academic-year.repository';
import { TermRepository } from '../term.repository';
import { TermRelationalRepository } from './repositories/term.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicYearEntity, TermEntity])],
  providers: [
    {
      provide: AcademicYearRepository,
      useClass: AcademicYearRelationalRepository,
    },
    {
      provide: TermRepository,
      useClass: TermRelationalRepository,
    },
  ],
  exports: [AcademicYearRepository, TermRepository],
})
export class AcademicRelationalPersistenceModule {}
