import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { UserPermissionOverrideEntity } from './entities/user-permission-override.entity';
import { AuditLogEntity } from './entities/audit-log.entity';
import { PermissionRepository } from '../permission.repository';
import { RolePermissionRepository } from '../role-permission.repository';
import { UserPermissionOverrideRepository } from '../user-permission-override.repository';
import { AuditLogRepository } from '../audit-log.repository';
import { PermissionRelationalRepository } from './repositories/permission.repository';
import { RolePermissionRelationalRepository } from './repositories/role-permission.repository';
import { UserPermissionOverrideRelationalRepository } from './repositories/user-permission-override.repository';
import { AuditLogRelationalRepository } from './repositories/audit-log.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PermissionEntity,
      RolePermissionEntity,
      UserPermissionOverrideEntity,
      AuditLogEntity,
    ]),
  ],
  providers: [
    {
      provide: PermissionRepository,
      useClass: PermissionRelationalRepository,
    },
    {
      provide: RolePermissionRepository,
      useClass: RolePermissionRelationalRepository,
    },
    {
      provide: UserPermissionOverrideRepository,
      useClass: UserPermissionOverrideRelationalRepository,
    },
    {
      provide: AuditLogRepository,
      useClass: AuditLogRelationalRepository,
    },
  ],
  exports: [
    PermissionRepository,
    RolePermissionRepository,
    UserPermissionOverrideRepository,
    AuditLogRepository,
  ],
})
export class AuthorizationRelationalPersistenceModule {}
