import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradeClassEntity } from '../entities/grade-class.entity';
import { GradeClassRepository } from '../../grade-class.repository';
import { GradeClassMapper } from '../mappers/grade-class.mapper';
import { GradeClass } from '../../../../domain/grade-class';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class GradeClassRelationalRepository implements GradeClassRepository {
  constructor(
    @InjectRepository(GradeClassEntity)
    private readonly repo: Repository<GradeClassEntity>,
  ) {}

  async create(
    data: Omit<GradeClass, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<GradeClass> {
    const persistenceModel = this.repo.create(
      GradeClassMapper.toPersistence(data as GradeClass),
    );
    const saved = await this.repo.save(persistenceModel);
    return GradeClassMapper.toDomain(saved);
  }

  async findAll(): Promise<GradeClass[]> {
    const entities = await this.repo.find({ relations: ['institution'] });
    return entities.map(GradeClassMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<GradeClass>> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['institution'],
    });
    return entity ? GradeClassMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<GradeClass>,
  ): Promise<GradeClass | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['institution'],
    });
    if (!entity) return null;

    const updated = await this.repo.save(
      this.repo.create(
        GradeClassMapper.toPersistence({
          ...GradeClassMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return GradeClassMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
