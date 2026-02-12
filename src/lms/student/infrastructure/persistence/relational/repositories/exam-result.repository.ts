import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamResultEntity } from '../entities/exam-result.entity';
import { ExamResultRepository } from '../../exam-result.repository';
import { ExamResultMapper } from '../mappers/exam-result.mapper';
import { ExamResult } from '../../../../domain/exam-result';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class ExamResultRelationalRepository implements ExamResultRepository {
  constructor(
    @InjectRepository(ExamResultEntity)
    private readonly repo: Repository<ExamResultEntity>,
  ) {}

  async create(
    data: Omit<ExamResult, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<ExamResult> {
    const persistenceModel = this.repo.create(
      ExamResultMapper.toPersistence(data as ExamResult),
    );
    const saved = await this.repo.save(persistenceModel);
    return ExamResultMapper.toDomain(saved);
  }

  async findAll(): Promise<ExamResult[]> {
    const entities = await this.repo.find();
    return entities.map(ExamResultMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<ExamResult>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? ExamResultMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<ExamResult>,
  ): Promise<ExamResult | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        ExamResultMapper.toPersistence({
          ...ExamResultMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return ExamResultMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
