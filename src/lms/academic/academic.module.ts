import { Module } from '@nestjs/common';
import { AcademicRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AcademicService } from './academic.service';
import { AcademicYearController, TermController } from './academic.controller';

@Module({
  imports: [AcademicRelationalPersistenceModule],
  controllers: [AcademicYearController, TermController],
  providers: [AcademicService],
  exports: [AcademicService],
})
export class AcademicModule {}
