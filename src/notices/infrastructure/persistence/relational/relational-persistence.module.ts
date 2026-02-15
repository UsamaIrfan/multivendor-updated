import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeEntity } from './entities/notice.entity';
import { NoticesRepository } from '../notices.repository';
import { NoticesRelationalRepository } from './repositories/notices.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NoticeEntity])],
  providers: [
    {
      provide: NoticesRepository,
      useClass: NoticesRelationalRepository,
    },
  ],
  exports: [NoticesRepository],
})
export class NoticesRelationalPersistenceModule {}
