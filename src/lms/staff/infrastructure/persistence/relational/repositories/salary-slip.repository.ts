import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalarySlipEntity } from '../entities/salary-slip.entity';
import { SalarySlip } from '../../../../domain/salary-slip';
import { SalarySlipRepository } from '../../salary-slip.repository';
import { SalarySlipMapper } from '../mappers/salary-slip.mapper';
import { DeepPartial } from '../../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class SalarySlipRelationalRepository implements SalarySlipRepository {
  constructor(
    @InjectRepository(SalarySlipEntity)
    private readonly repo: Repository<SalarySlipEntity>,
  ) {}

  async create(data: DeepPartial<SalarySlip>): Promise<SalarySlip> {
    const entity = this.repo.create(data as any) as unknown as SalarySlipEntity;
    const saved = await this.repo.save(entity);
    return SalarySlipMapper.toDomain(saved);
  }

  async findAll(): Promise<SalarySlip[]> {
    const entities = await this.repo.find();
    return entities.map(SalarySlipMapper.toDomain);
  }

  async findById(id: SalarySlip['id']): Promise<NullableType<SalarySlip>> {
    const entity = await this.repo.findOne({ where: { id } as any });
    return entity ? SalarySlipMapper.toDomain(entity) : null;
  }

  async update(
    id: SalarySlip['id'],
    data: DeepPartial<SalarySlip>,
  ): Promise<SalarySlip | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({ where: { id } as any });
    return entity ? SalarySlipMapper.toDomain(entity) : null;
  }

  async remove(id: SalarySlip['id']): Promise<void> {
    await this.repo.softDelete(id);
  }
}
