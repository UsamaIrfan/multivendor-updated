import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthorizationRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { TenantModule } from '../tenant/tenant.module';
import { PermissionService } from './services/permission.service';
import { ScopeResolverService } from './services/scope-resolver.service';
import { AuditService } from './services/audit.service';
import { PermissionInterceptor } from './interceptors/permission.interceptor';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { PermissionsGuard } from './guards/permissions.guard';
import {
  PermissionController,
  RolePermissionController,
  UserPermissionOverrideController,
  AuditLogController,
  AuthorizationMeController,
} from './authorization.controller';

@Global()
@Module({
  imports: [AuthorizationRelationalPersistenceModule, TenantModule],
  controllers: [
    PermissionController,
    RolePermissionController,
    UserPermissionOverrideController,
    AuditLogController,
    AuthorizationMeController,
  ],
  providers: [
    PermissionService,
    ScopeResolverService,
    AuditService,
    PermissionsGuard,
    // Global interceptor: resolves permissions + scope for requests
    // that don't go through PermissionsGuard (e.g. /me/permissions)
    {
      provide: APP_INTERCEPTOR,
      useClass: PermissionInterceptor,
    },
    // Global interceptor: audit logs for mutating requests
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [
    PermissionService,
    ScopeResolverService,
    AuditService,
    PermissionsGuard,
  ],
})
export class AuthorizationModule {}
