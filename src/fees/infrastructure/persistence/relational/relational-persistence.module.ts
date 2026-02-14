import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConcessionEntity } from './entities/concession.entity';
import { ReceiptEntity } from './entities/receipt.entity';
import { ConcessionRepository } from '../concession.repository';
import { ConcessionRelationalRepository } from './repositories/concession.repository';
import { ReceiptRepository } from '../receipt.repository';
import { ReceiptRelationalRepository } from './repositories/receipt.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ConcessionEntity, ReceiptEntity])],
  providers: [
    {
      provide: ConcessionRepository,
      useClass: ConcessionRelationalRepository,
    },
    {
      provide: ReceiptRepository,
      useClass: ReceiptRelationalRepository,
    },
  ],
  exports: [ConcessionRepository, ReceiptRepository],
})
export class FeesRelationalPersistenceModule {}
