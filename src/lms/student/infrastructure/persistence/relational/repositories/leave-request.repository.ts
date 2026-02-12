import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequestEntity } from '../entities/leave-request.entity';
import { LeaveRequestRepository } from '../../leave-request.repository';
import { LeaveRequestMapper } from '../mappers/leave-request.mapper';
import { LeaveRequest } from '../../../../domain/leave-request';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class LeaveRequestRelationalRepository
  implements LeaveRequestRepository
{
  constructor(
    @InjectRepository(LeaveRequestEntity)
    private readonly repo: Repository<LeaveRequestEntity>,
  ) {}

  async create(
    data: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<LeaveRequest> {
    const persistenceModel = this.repo.create(
      LeaveRequestMapper.toPersistence(data as LeaveRequest),
    );
    const saved = await this.repo.save(persistenceModel);
    return LeaveRequestMapper.toDomain(saved);
  }

  async findAll(): Promise<LeaveRequest[]> {
    const entities = await this.repo.find();
    return entities.map(LeaveRequestMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<LeaveRequest>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? LeaveRequestMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<LeaveRequest>,
  ): Promise<LeaveRequest | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        LeaveRequestMapper.toPersistence({
          ...LeaveRequestMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return LeaveRequestMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
