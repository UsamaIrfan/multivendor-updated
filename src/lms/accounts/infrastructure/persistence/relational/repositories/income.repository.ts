import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncomeEntity } from '../entities/income.entity';
import { Income } from '../../../../domain/income';
import { IncomeRepository } from '../../income.repository';
import { IncomeMapper } from '../mappers/income.mapper';
import { DeepPartial } from '../../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class IncomeRelationalRepository implements IncomeRepository {
  constructor(
    @InjectRepository(IncomeEntity)
    private readonly repo: Repository<IncomeEntity>,
  ) {}

  async create(data: DeepPartial<Income>): Promise<Income> {
    const entity = this.repo.create(data as any) as unknown as IncomeEntity;
    const saved = await this.repo.save(entity);
    return IncomeMapper.toDomain(saved);
  }

  async findAll(): Promise<Income[]> {
    const entities = await this.repo.find();
    return entities.map(IncomeMapper.toDomain);
  }

  async findById(id: Income['id']): Promise<NullableType<Income>> {
    const entity = await this.repo.findOne({ where: { id } as any });
    return entity ? IncomeMapper.toDomain(entity) : null;
  }

  async update(
    id: Income['id'],
    data: DeepPartial<Income>,
  ): Promise<Income | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({ where: { id } as any });
    return entity ? IncomeMapper.toDomain(entity) : null;
  }

  async remove(id: Income['id']): Promise<void> {
    await this.repo.softDelete(id);
  }
}
