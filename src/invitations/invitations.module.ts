import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InvitationRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { TenantModule } from '../tenant/tenant.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    InvitationRelationalPersistenceModule,
    JwtModule.register({}),
    MailModule,
    UsersModule,
    TenantModule,
    SessionModule,
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
