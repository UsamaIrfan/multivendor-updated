import { Module } from '@nestjs/common';
import { StaffManagementRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { StaffManagementService } from './staff-management.service';
import { StaffManagementController } from './staff-management.controller';
import { TenantModule } from '../tenant/tenant.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    StaffManagementRelationalPersistenceModule,
    TenantModule,
    UsersModule,
  ],
  controllers: [StaffManagementController],
  providers: [StaffManagementService],
  exports: [StaffManagementService],
})
export class StaffManagementModule {}
