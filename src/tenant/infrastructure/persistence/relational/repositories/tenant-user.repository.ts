import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantUserEntity } from '../entities/tenant-user.entity';
import { TenantUserRepository } from '../../tenant-user.repository';
import { TenantUserMapper } from '../mappers/tenant-user.mapper';
import { TenantUser } from '../../../../domain/tenant-user';
import { NullableType } from '../../../../../utils/types/nullable.type';

@Injectable()
export class TenantUserRelationalRepository implements TenantUserRepository {
  constructor(
    @InjectRepository(TenantUserEntity)
    private readonly repo: Repository<TenantUserEntity>,
  ) {}

  async create(
    data: Omit<TenantUser, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<TenantUser> {
    const persistenceModel = this.repo.create(
      TenantUserMapper.toPersistence(data as TenantUser),
    );
    const saved = await this.repo.save(persistenceModel);
    const full = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['tenant', 'user'],
    });
    return TenantUserMapper.toDomain(full!);
  }

  async findByTenantAndUser(
    tenantId: string,
    userId: number,
  ): Promise<NullableType<TenantUser>> {
    const entity = await this.repo.findOne({
      where: {
        tenant: { id: tenantId },
        user: { id: userId },
      },
      relations: ['tenant', 'user'],
    });
    return entity ? TenantUserMapper.toDomain(entity) : null;
  }

  async findAllByUser(userId: number): Promise<TenantUser[]> {
    const entities = await this.repo.find({
      where: { user: { id: userId } },
      relations: ['tenant', 'user'],
    });
    return entities.map(TenantUserMapper.toDomain);
  }

  async findAllByTenant(tenantId: string): Promise<TenantUser[]> {
    const entities = await this.repo.find({
      where: { tenant: { id: tenantId } },
      relations: ['tenant', 'user'],
    });
    return entities.map(TenantUserMapper.toDomain);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
