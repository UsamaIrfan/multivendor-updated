import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYearEntity } from '../entities/academic-year.entity';
import { AcademicYearRepository } from '../../academic-year.repository';
import { AcademicYearMapper } from '../mappers/academic-year.mapper';
import { AcademicYear } from '../../../../domain/academic-year';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class AcademicYearRelationalRepository
  implements AcademicYearRepository
{
  constructor(
    @InjectRepository(AcademicYearEntity)
    private readonly repo: Repository<AcademicYearEntity>,
  ) {}

  async create(
    data: Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<AcademicYear> {
    const persistenceModel = this.repo.create(
      AcademicYearMapper.toPersistence(data as AcademicYear),
    );
    const saved = await this.repo.save(persistenceModel);
    return AcademicYearMapper.toDomain(saved);
  }

  async findAll(): Promise<AcademicYear[]> {
    const entities = await this.repo.find({ relations: ['institution'] });
    return entities.map(AcademicYearMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<AcademicYear>> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['institution'],
    });
    return entity ? AcademicYearMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<AcademicYear>,
  ): Promise<AcademicYear | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['institution'],
    });
    if (!entity) return null;

    const updated = await this.repo.save(
      this.repo.create(
        AcademicYearMapper.toPersistence({
          ...AcademicYearMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return AcademicYearMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
