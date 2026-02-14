import { Module } from '@nestjs/common';
import { FeesController } from './fees.controller';
import { FeesService } from './fees.service';
import { FeeCalculatorService } from './fee-calculator.service';
import { ChallanGeneratorService } from './challan-generator.service';
import { FeesRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { StudentRelationalPersistenceModule } from '../lms/student/infrastructure/persistence/relational/relational-persistence.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    FeesRelationalPersistenceModule,
    StudentRelationalPersistenceModule,
    MailModule,
  ],
  controllers: [FeesController],
  providers: [FeesService, FeeCalculatorService, ChallanGeneratorService],
  exports: [FeesService],
})
export class FeesModule {}
