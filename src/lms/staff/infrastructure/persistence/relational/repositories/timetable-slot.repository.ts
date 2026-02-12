import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimetableSlotEntity } from '../entities/timetable-slot.entity';
import { TimetableSlot } from '../../../../domain/timetable-slot';
import { TimetableSlotRepository } from '../../timetable-slot.repository';
import { TimetableSlotMapper } from '../mappers/timetable-slot.mapper';
import { DeepPartial } from '../../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class TimetableSlotRelationalRepository
  implements TimetableSlotRepository
{
  constructor(
    @InjectRepository(TimetableSlotEntity)
    private readonly repo: Repository<TimetableSlotEntity>,
  ) {}

  async create(data: DeepPartial<TimetableSlot>): Promise<TimetableSlot> {
    const entity = this.repo.create(data as any) as unknown as TimetableSlotEntity;
    const saved = await this.repo.save(entity);
    return TimetableSlotMapper.toDomain(saved);
  }

  async findAll(): Promise<TimetableSlot[]> {
    const entities = await this.repo.find();
    return entities.map(TimetableSlotMapper.toDomain);
  }

  async findById(
    id: TimetableSlot['id'],
  ): Promise<NullableType<TimetableSlot>> {
    const entity = await this.repo.findOne({ where: { id } as any });
    return entity ? TimetableSlotMapper.toDomain(entity) : null;
  }

  async update(
    id: TimetableSlot['id'],
    data: DeepPartial<TimetableSlot>,
  ): Promise<TimetableSlot | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({ where: { id } as any });
    return entity ? TimetableSlotMapper.toDomain(entity) : null;
  }

  async remove(id: TimetableSlot['id']): Promise<void> {
    await this.repo.softDelete(id);
  }
}
