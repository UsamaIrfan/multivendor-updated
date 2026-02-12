import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeChallanEntity } from '../entities/fee-challan.entity';
import { FeeChallanRepository } from '../../fee-challan.repository';
import { FeeChallanMapper } from '../mappers/fee-challan.mapper';
import { FeeChallan } from '../../../../domain/fee-challan';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class FeeChallanRelationalRepository implements FeeChallanRepository {
  constructor(
    @InjectRepository(FeeChallanEntity)
    private readonly repo: Repository<FeeChallanEntity>,
  ) {}

  async create(
    data: Omit<FeeChallan, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<FeeChallan> {
    const persistenceModel = this.repo.create(
      FeeChallanMapper.toPersistence(data as FeeChallan),
    );
    const saved = await this.repo.save(persistenceModel);
    return FeeChallanMapper.toDomain(saved);
  }

  async findAll(): Promise<FeeChallan[]> {
    const entities = await this.repo.find();
    return entities.map(FeeChallanMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<FeeChallan>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? FeeChallanMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<FeeChallan>,
  ): Promise<FeeChallan | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        FeeChallanMapper.toPersistence({
          ...FeeChallanMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return FeeChallanMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
