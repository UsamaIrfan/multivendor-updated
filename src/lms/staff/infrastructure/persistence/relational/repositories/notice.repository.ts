import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeEntity } from '../entities/notice.entity';
import { Notice } from '../../../../domain/notice';
import { NoticeRepository } from '../../notice.repository';
import { NoticeMapper } from '../mappers/notice.mapper';
import { DeepPartial } from '../../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class NoticeRelationalRepository implements NoticeRepository {
  constructor(
    @InjectRepository(NoticeEntity)
    private readonly repo: Repository<NoticeEntity>,
  ) {}

  async create(data: DeepPartial<Notice>): Promise<Notice> {
    const entity = this.repo.create(data as any) as unknown as NoticeEntity;
    const saved = await this.repo.save(entity);
    return NoticeMapper.toDomain(saved);
  }

  async findAll(): Promise<Notice[]> {
    const entities = await this.repo.find();
    return entities.map(NoticeMapper.toDomain);
  }

  async findById(id: Notice['id']): Promise<NullableType<Notice>> {
    const entity = await this.repo.findOne({ where: { id } as any });
    return entity ? NoticeMapper.toDomain(entity) : null;
  }

  async update(
    id: Notice['id'],
    data: DeepPartial<Notice>,
  ): Promise<Notice | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({ where: { id } as any });
    return entity ? NoticeMapper.toDomain(entity) : null;
  }

  async remove(id: Notice['id']): Promise<void> {
    await this.repo.softDelete(id);
  }
}
