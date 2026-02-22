import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermissionEntity } from '../entities/role-permission.entity';
import {
  EffectivePermissionRow,
  RolePermissionRepository,
} from '../../role-permission.repository';
import { RolePermissionMapper } from '../mappers/role-permission.mapper';
import { RolePermission } from '../../../../domain/role-permission';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';

@Injectable()
export class RolePermissionRelationalRepository
  implements RolePermissionRepository
{
  constructor(
    @InjectRepository(RolePermissionEntity)
    private readonly repo: Repository<RolePermissionEntity>,
  ) {}

  async create(data: DeepPartial<RolePermission>): Promise<RolePermission> {
    const entity = this.repo.create(
      RolePermissionMapper.toPersistence(data as RolePermission),
    );
    const saved = await this.repo.save(entity);
    return RolePermissionMapper.toDomain(saved);
  }

  async findByRoleId(roleId: number): Promise<RolePermission[]> {
    const entities = await this.repo.find({
      where: { roleId },
      relations: ['permission'],
    });
    return entities.map(RolePermissionMapper.toDomain);
  }

  async findEffectiveByRoleId(
    roleId: number,
  ): Promise<EffectivePermissionRow[]> {
    const rows = await this.repo
      .createQueryBuilder('rp')
      .innerJoinAndSelect('rp.permission', 'p')
      .where('rp.roleId = :roleId', { roleId })
      .select(['p.code AS code', 'rp.scope AS scope'])
      .getRawMany();

    return rows.map((r) => ({
      code: r.code as string,
      scope: r.scope,
    }));
  }

  async remove(roleId: number, permissionId: number): Promise<void> {
    await this.repo.delete({ roleId, permissionId });
  }

  async removeAllByRoleId(roleId: number): Promise<void> {
    await this.repo.delete({ roleId });
  }
}
