import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffEntity } from '../entities/staff.entity';
import { Staff } from '../../../../domain/staff';
import { StaffRepository } from '../../staff.repository';
import { StaffMapper } from '../mappers/staff.mapper';
import { DeepPartial } from '../../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class StaffRelationalRepository implements StaffRepository {
  constructor(
    @InjectRepository(StaffEntity)
    private readonly repo: Repository<StaffEntity>,
  ) {}

  async create(data: DeepPartial<Staff>): Promise<Staff> {
    const entity = this.repo.create(data as any) as unknown as StaffEntity;
    const saved = await this.repo.save(entity);
    return StaffMapper.toDomain(saved);
  }

  async findAll(): Promise<Staff[]> {
    const entities = await this.repo.find();
    return entities.map(StaffMapper.toDomain);
  }

  async findById(id: Staff['id']): Promise<NullableType<Staff>> {
    const entity = await this.repo.findOne({ where: { id } as any });
    return entity ? StaffMapper.toDomain(entity) : null;
  }

  async update(
    id: Staff['id'],
    data: DeepPartial<Staff>,
  ): Promise<Staff | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({ where: { id } as any });
    return entity ? StaffMapper.toDomain(entity) : null;
  }

  async remove(id: Staff['id']): Promise<void> {
    await this.repo.softDelete(id);
  }
}
