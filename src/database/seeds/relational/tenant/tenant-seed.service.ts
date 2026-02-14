import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from '../../../../tenant/infrastructure/persistence/relational/entities/tenant.entity';
import { BranchEntity } from '../../../../tenant/infrastructure/persistence/relational/entities/branch.entity';
import { TenantUserEntity } from '../../../../tenant/infrastructure/persistence/relational/entities/tenant-user.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_BRANCH_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class TenantSeedService {
  constructor(
    @InjectRepository(TenantEntity)
    private tenantRepository: Repository<TenantEntity>,
    @InjectRepository(BranchEntity)
    private branchRepository: Repository<BranchEntity>,
    @InjectRepository(TenantUserEntity)
    private tenantUserRepository: Repository<TenantUserEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async run() {
    // Seed default tenant
    const countTenant = await this.tenantRepository.count({
      where: { id: DEFAULT_TENANT_ID },
    });

    if (!countTenant) {
      await this.tenantRepository.save(
        this.tenantRepository.create({
          id: DEFAULT_TENANT_ID,
          name: 'Default Tenant',
          slug: 'default',
          isActive: true,
        }),
      );
    }

    // Seed default branch
    const countBranch = await this.branchRepository.count({
      where: { id: DEFAULT_BRANCH_ID },
    });

    if (!countBranch) {
      await this.branchRepository.save(
        this.branchRepository.create({
          id: DEFAULT_BRANCH_ID,
          tenant: { id: DEFAULT_TENANT_ID } as TenantEntity,
          name: 'Main Branch',
          code: 'MAIN',
          isActive: true,
          isHeadquarters: true,
        }),
      );
    }

    // Assign all existing users to default tenant
    const users = await this.userRepository.find();
    for (const user of users) {
      const exists = await this.tenantUserRepository.count({
        where: {
          tenant: { id: DEFAULT_TENANT_ID },
          user: { id: user.id },
        },
      });

      if (!exists) {
        await this.tenantUserRepository.save(
          this.tenantUserRepository.create({
            tenant: { id: DEFAULT_TENANT_ID } as TenantEntity,
            user: { id: user.id } as UserEntity,
            isActive: true,
          }),
        );
      }
    }
  }
}
