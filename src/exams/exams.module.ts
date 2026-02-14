import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { GradeCalculatorService } from './grade-calculator.service';
import { RankCalculatorService } from './rank-calculator.service';
import { ReportCardService } from './report-card.service';
import { ExamsRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { StudentRelationalPersistenceModule } from '../lms/student/infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    ExamsRelationalPersistenceModule,
    StudentRelationalPersistenceModule,
  ],
  controllers: [ExamsController],
  providers: [
    ExamsService,
    GradeCalculatorService,
    RankCalculatorService,
    ReportCardService,
  ],
  exports: [ExamsService],
})
export class ExamsModule {}
