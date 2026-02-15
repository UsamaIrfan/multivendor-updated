import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from '../entities/tenant.entity';
import { TenantRepository } from '../../tenant.repository';
import { TenantMapper } from '../mappers/tenant.mapper';
import { Tenant } from '../../../../domain/tenant';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';

@Injectable()
export class TenantRelationalRepository implements TenantRepository {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly repo: Repository<TenantEntity>,
  ) {}

  async create(data: DeepPartial<Tenant>): Promise<Tenant> {
    const persistenceModel = this.repo.create(
      TenantMapper.toPersistence(data as Tenant),
    );
    const saved = await this.repo.save(persistenceModel);
    return TenantMapper.toDomain(saved);
  }

  async findAll(): Promise<Tenant[]> {
    const entities = await this.repo.find();
    return entities.map(TenantMapper.toDomain);
  }

  async findById(id: string): Promise<NullableType<Tenant>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? TenantMapper.toDomain(entity) : null;
  }

  async findBySlug(slug: string): Promise<NullableType<Tenant>> {
    const entity = await this.repo.findOne({ where: { slug } });
    return entity ? TenantMapper.toDomain(entity) : null;
  }

  async update(
    id: string,
    payload: DeepPartial<Tenant>,
  ): Promise<Tenant | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;

    const updated = await this.repo.save(
      this.repo.create(
        TenantMapper.toPersistence({
          ...TenantMapper.toDomain(entity),
          ...payload,
        } as Tenant),
      ),
    );
    return TenantMapper.toDomain(updated);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
