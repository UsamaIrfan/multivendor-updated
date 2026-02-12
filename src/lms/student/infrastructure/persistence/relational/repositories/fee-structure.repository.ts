import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeStructureEntity } from '../entities/fee-structure.entity';
import { FeeStructureRepository } from '../../fee-structure.repository';
import { FeeStructureMapper } from '../mappers/fee-structure.mapper';
import { FeeStructure } from '../../../../domain/fee-structure';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class FeeStructureRelationalRepository
  implements FeeStructureRepository
{
  constructor(
    @InjectRepository(FeeStructureEntity)
    private readonly repo: Repository<FeeStructureEntity>,
  ) {}

  async create(
    data: Omit<FeeStructure, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<FeeStructure> {
    const persistenceModel = this.repo.create(
      FeeStructureMapper.toPersistence(data as FeeStructure),
    );
    const saved = await this.repo.save(persistenceModel);
    return FeeStructureMapper.toDomain(saved);
  }

  async findAll(): Promise<FeeStructure[]> {
    const entities = await this.repo.find();
    return entities.map(FeeStructureMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<FeeStructure>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? FeeStructureMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<FeeStructure>,
  ): Promise<FeeStructure | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        FeeStructureMapper.toPersistence({
          ...FeeStructureMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return FeeStructureMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
