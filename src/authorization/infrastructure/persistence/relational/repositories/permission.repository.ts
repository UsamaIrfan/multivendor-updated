import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PermissionEntity } from '../entities/permission.entity';
import { PermissionRepository } from '../../permission.repository';
import { PermissionMapper } from '../mappers/permission.mapper';
import { Permission } from '../../../../domain/permission';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';

@Injectable()
export class PermissionRelationalRepository implements PermissionRepository {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly repo: Repository<PermissionEntity>,
  ) {}

  async create(data: DeepPartial<Permission>): Promise<Permission> {
    const entity = this.repo.create(
      PermissionMapper.toPersistence(data as Permission),
    );
    const saved = await this.repo.save(entity);
    return PermissionMapper.toDomain(saved);
  }

  async findAll(): Promise<Permission[]> {
    const entities = await this.repo.find({
      order: { domain: 'ASC', code: 'ASC' },
    });
    return entities.map(PermissionMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<Permission>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? PermissionMapper.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<NullableType<Permission>> {
    const entity = await this.repo.findOne({ where: { code } });
    return entity ? PermissionMapper.toDomain(entity) : null;
  }

  async findByDomain(domain: string): Promise<Permission[]> {
    const entities = await this.repo.find({
      where: { domain },
      order: { code: 'ASC' },
    });
    return entities.map(PermissionMapper.toDomain);
  }

  async findByCodes(codes: string[]): Promise<Permission[]> {
    if (codes.length === 0) return [];
    const entities = await this.repo.find({
      where: { code: In(codes) },
    });
    return entities.map(PermissionMapper.toDomain);
  }

  async update(
    id: number,
    payload: DeepPartial<Permission>,
  ): Promise<Permission | null> {
    await this.repo.update(id, payload as any);
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? PermissionMapper.toDomain(entity) : null;
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
