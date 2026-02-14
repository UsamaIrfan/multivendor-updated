import { Module } from '@nestjs/common';
import { TenantRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { TenantContextModule } from './tenant-context/tenant-context.module';
import { TenantService } from './tenant.service';
import {
  TenantController,
  BranchController,
  TenantUserController,
} from './tenant.controller';

@Module({
  imports: [TenantRelationalPersistenceModule, TenantContextModule],
  controllers: [TenantController, BranchController, TenantUserController],
  providers: [TenantService],
  exports: [TenantService, TenantContextModule, TenantRelationalPersistenceModule],
})
export class TenantModule {}
