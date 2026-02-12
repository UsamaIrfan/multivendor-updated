import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamEntity } from '../entities/exam.entity';
import { ExamRepository } from '../../exam.repository';
import { ExamMapper } from '../mappers/exam.mapper';
import { Exam } from '../../../../domain/exam';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class ExamRelationalRepository implements ExamRepository {
  constructor(
    @InjectRepository(ExamEntity)
    private readonly repo: Repository<ExamEntity>,
  ) {}

  async create(
    data: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Exam> {
    const persistenceModel = this.repo.create(
      ExamMapper.toPersistence(data as Exam),
    );
    const saved = await this.repo.save(persistenceModel);
    return ExamMapper.toDomain(saved);
  }

  async findAll(): Promise<Exam[]> {
    const entities = await this.repo.find();
    return entities.map(ExamMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<Exam>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? ExamMapper.toDomain(entity) : null;
  }

  async update(id: number, payload: Partial<Exam>): Promise<Exam | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        ExamMapper.toPersistence({
          ...ExamMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return ExamMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
