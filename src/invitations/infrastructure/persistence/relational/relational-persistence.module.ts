import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationEntity } from './entities/invitation.entity';
import { InvitationRepository } from '../invitation.repository';
import { InvitationRelationalRepository } from './repositories/invitation.repository';

@Module({
  imports: [TypeOrmModule.forFeature([InvitationEntity])],
  providers: [
    {
      provide: InvitationRepository,
      useClass: InvitationRelationalRepository,
    },
  ],
  exports: [InvitationRepository],
})
export class InvitationRelationalPersistenceModule {}
