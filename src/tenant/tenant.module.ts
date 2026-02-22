import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TenantRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { TenantContextModule } from './tenant-context/tenant-context.module';
import { TenantService } from './tenant.service';
import { TenantInterceptor } from './interceptors/tenant.interceptor';
import { RequireTenantGuard } from './guards/require-tenant.guard';
import {
  TenantController,
  BranchController,
  TenantUserController,
} from './tenant.controller';

@Module({
  imports: [TenantRelationalPersistenceModule, TenantContextModule],
  controllers: [TenantController, BranchController, TenantUserController],
  providers: [
    TenantService,
    RequireTenantGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
  exports: [
    TenantService,
    RequireTenantGuard,
    TenantContextModule,
    TenantRelationalPersistenceModule,
  ],
})
export class TenantModule {}
