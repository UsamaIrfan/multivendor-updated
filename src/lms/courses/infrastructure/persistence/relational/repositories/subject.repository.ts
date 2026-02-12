import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectEntity } from '../entities/subject.entity';
import { SubjectRepository } from '../../subject.repository';
import { SubjectMapper } from '../mappers/subject.mapper';
import { Subject } from '../../../../domain/subject';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class SubjectRelationalRepository implements SubjectRepository {
  constructor(
    @InjectRepository(SubjectEntity)
    private readonly repo: Repository<SubjectEntity>,
  ) {}

  async create(
    data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Subject> {
    const persistenceModel = this.repo.create(
      SubjectMapper.toPersistence(data as Subject),
    );
    const saved = await this.repo.save(persistenceModel);
    return SubjectMapper.toDomain(saved);
  }

  async findAll(): Promise<Subject[]> {
    const entities = await this.repo.find({ relations: ['department'] });
    return entities.map(SubjectMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<Subject>> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['department'],
    });
    return entity ? SubjectMapper.toDomain(entity) : null;
  }

  async update(id: number, payload: Partial<Subject>): Promise<Subject | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['department'],
    });
    if (!entity) return null;

    const updated = await this.repo.save(
      this.repo.create(
        SubjectMapper.toPersistence({
          ...SubjectMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return SubjectMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
