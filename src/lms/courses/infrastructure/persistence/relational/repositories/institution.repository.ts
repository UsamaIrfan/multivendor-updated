import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstitutionEntity } from '../entities/institution.entity';
import { InstitutionRepository } from '../../institution.repository';
import { InstitutionMapper } from '../mappers/institution.mapper';
import { Institution } from '../../../../domain/institution';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class InstitutionRelationalRepository implements InstitutionRepository {
  constructor(
    @InjectRepository(InstitutionEntity)
    private readonly repo: Repository<InstitutionEntity>,
  ) {}

  async create(
    data: Omit<Institution, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Institution> {
    const persistenceModel = this.repo.create(
      InstitutionMapper.toPersistence(data as Institution),
    );
    const saved = await this.repo.save(persistenceModel);
    return InstitutionMapper.toDomain(saved);
  }

  async findAll(): Promise<Institution[]> {
    const entities = await this.repo.find();
    return entities.map(InstitutionMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<Institution>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? InstitutionMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<Institution>,
  ): Promise<Institution | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;

    const updated = await this.repo.save(
      this.repo.create(
        InstitutionMapper.toPersistence({
          ...InstitutionMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return InstitutionMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
