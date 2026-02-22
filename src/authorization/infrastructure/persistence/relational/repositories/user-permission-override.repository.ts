import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPermissionOverrideEntity } from '../entities/user-permission-override.entity';
import {
  UserOverrideRow,
  UserPermissionOverrideRepository,
} from '../../user-permission-override.repository';
import { UserPermissionOverrideMapper } from '../mappers/user-permission-override.mapper';
import { UserPermissionOverride } from '../../../../domain/user-permission-override';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';

@Injectable()
export class UserPermissionOverrideRelationalRepository
  implements UserPermissionOverrideRepository
{
  constructor(
    @InjectRepository(UserPermissionOverrideEntity)
    private readonly repo: Repository<UserPermissionOverrideEntity>,
  ) {}

  async create(
    data: DeepPartial<UserPermissionOverride>,
  ): Promise<UserPermissionOverride> {
    const entity = this.repo.create(
      UserPermissionOverrideMapper.toPersistence(
        data as UserPermissionOverride,
      ),
    );
    const saved = await this.repo.save(entity);
    return UserPermissionOverrideMapper.toDomain(saved);
  }

  async findByUserAndTenant(
    userId: number,
    tenantId: string,
  ): Promise<UserPermissionOverride[]> {
    const entities = await this.repo.find({
      where: { userId, tenantId },
      relations: ['permission'],
    });
    return entities.map(UserPermissionOverrideMapper.toDomain);
  }

  async findOverridesByUserAndTenant(
    userId: number,
    tenantId: string,
  ): Promise<UserOverrideRow[]> {
    const rows = await this.repo
      .createQueryBuilder('upo')
      .innerJoinAndSelect('upo.permission', 'p')
      .where('upo.userId = :userId', { userId })
      .andWhere('upo.tenantId = :tenantId', { tenantId })
      .select(['p.code AS code', 'upo.action AS action', 'upo.scope AS scope'])
      .getRawMany();

    return rows.map((r) => ({
      code: r.code as string,
      action: r.action,
      scope: r.scope,
    }));
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async removeByUserAndTenant(
    userId: number,
    tenantId: string,
    permissionId: number,
  ): Promise<void> {
    await this.repo.delete({ userId, tenantId, permissionId });
  }
}
