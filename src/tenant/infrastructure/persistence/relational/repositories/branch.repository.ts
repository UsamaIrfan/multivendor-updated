import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchEntity } from '../entities/branch.entity';
import { BranchRepository } from '../../branch.repository';
import { BranchMapper } from '../mappers/branch.mapper';
import { Branch } from '../../../../domain/branch';
import { NullableType } from '../../../../../utils/types/nullable.type';

@Injectable()
export class BranchRelationalRepository implements BranchRepository {
  constructor(
    @InjectRepository(BranchEntity)
    private readonly repo: Repository<BranchEntity>,
  ) {}

  async create(
    data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Branch> {
    const persistenceModel = this.repo.create(
      BranchMapper.toPersistence(data as Branch),
    );
    const saved = await this.repo.save(persistenceModel);
    const full = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['tenant'],
    });
    return BranchMapper.toDomain(full!);
  }

  async findAllByTenant(tenantId: string): Promise<Branch[]> {
    const entities = await this.repo.find({
      where: { tenant: { id: tenantId } },
      relations: ['tenant'],
    });
    return entities.map(BranchMapper.toDomain);
  }

  async findByTenantAndCode(
    tenantId: string,
    code: string,
  ): Promise<NullableType<Branch>> {
    const entity = await this.repo.findOne({
      where: { tenant: { id: tenantId }, code },
      relations: ['tenant'],
    });
    return entity ? BranchMapper.toDomain(entity) : null;
  }

  async findById(id: string): Promise<NullableType<Branch>> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['tenant'],
    });
    return entity ? BranchMapper.toDomain(entity) : null;
  }

  async update(id: string, payload: Partial<Branch>): Promise<Branch | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['tenant'],
    });
    if (!entity) return null;

    const updated = await this.repo.save(
      this.repo.create(
        BranchMapper.toPersistence({
          ...BranchMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    const full = await this.repo.findOne({
      where: { id: updated.id },
      relations: ['tenant'],
    });
    return BranchMapper.toDomain(full!);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
