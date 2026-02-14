import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantSeedService } from './tenant-seed.service';
import { TenantEntity } from '../../../../tenant/infrastructure/persistence/relational/entities/tenant.entity';
import { BranchEntity } from '../../../../tenant/infrastructure/persistence/relational/entities/branch.entity';
import { TenantUserEntity } from '../../../../tenant/infrastructure/persistence/relational/entities/tenant-user.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantEntity,
      BranchEntity,
      TenantUserEntity,
      UserEntity,
    ]),
  ],
  providers: [TenantSeedService],
  exports: [TenantSeedService],
})
export class TenantSeedModule {}
