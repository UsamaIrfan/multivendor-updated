import { Module } from '@nestjs/common';
import { NoticesRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { NoticesService } from './notices.service';
import { NoticesController } from './notices.controller';

@Module({
  imports: [NoticesRelationalPersistenceModule],
  controllers: [NoticesController],
  providers: [NoticesService],
  exports: [NoticesService],
})
export class NoticesModule {}
