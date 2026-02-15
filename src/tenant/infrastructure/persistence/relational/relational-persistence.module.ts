import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './entities/tenant.entity';
import { BranchEntity } from './entities/branch.entity';
import { TenantUserEntity } from './entities/tenant-user.entity';
import { TenantRepository } from '../tenant.repository';
import { TenantRelationalRepository } from './repositories/tenant.repository';
import { BranchRepository } from '../branch.repository';
import { BranchRelationalRepository } from './repositories/branch.repository';
import { TenantUserRepository } from '../tenant-user.repository';
import { TenantUserRelationalRepository } from './repositories/tenant-user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TenantEntity, BranchEntity, TenantUserEntity]),
  ],
  providers: [
    {
      provide: TenantRepository,
      useClass: TenantRelationalRepository,
    },
    {
      provide: BranchRepository,
      useClass: BranchRelationalRepository,
    },
    {
      provide: TenantUserRepository,
      useClass: TenantUserRelationalRepository,
    },
  ],
  exports: [TenantRepository, BranchRepository, TenantUserRepository],
})
export class TenantRelationalPersistenceModule {}
