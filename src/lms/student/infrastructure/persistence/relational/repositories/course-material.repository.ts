import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseMaterialEntity } from '../entities/course-material.entity';
import { CourseMaterialRepository } from '../../course-material.repository';
import { CourseMaterialMapper } from '../mappers/course-material.mapper';
import { CourseMaterial } from '../../../../domain/course-material';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class CourseMaterialRelationalRepository
  implements CourseMaterialRepository
{
  constructor(
    @InjectRepository(CourseMaterialEntity)
    private readonly repo: Repository<CourseMaterialEntity>,
  ) {}

  async create(
    data: Omit<CourseMaterial, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<CourseMaterial> {
    const persistenceModel = this.repo.create(
      CourseMaterialMapper.toPersistence(data as CourseMaterial),
    );
    const saved = await this.repo.save(persistenceModel);
    return CourseMaterialMapper.toDomain(saved);
  }

  async findAll(): Promise<CourseMaterial[]> {
    const entities = await this.repo.find();
    return entities.map(CourseMaterialMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<CourseMaterial>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? CourseMaterialMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<CourseMaterial>,
  ): Promise<CourseMaterial | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        CourseMaterialMapper.toPersistence({
          ...CourseMaterialMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return CourseMaterialMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
