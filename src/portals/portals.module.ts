import { Module } from '@nestjs/common';
import { TenantModule } from '../tenant/tenant.module';
import { StaffManagementRelationalPersistenceModule } from '../staff-management/infrastructure/persistence/relational/relational-persistence.module';
import { PortalsService } from './portals.service';
import { PortalsController } from './portals.controller';

@Module({
  imports: [TenantModule, StaffManagementRelationalPersistenceModule],
  controllers: [PortalsController],
  providers: [PortalsService],
  exports: [PortalsService],
})
export class PortalsModule {}
