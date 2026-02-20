import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvitationEntity } from '../entities/invitation.entity';
import { InvitationRepository } from '../../invitation.repository';
import { InvitationMapper } from '../mappers/invitation.mapper';
import { Invitation, InvitationStatusEnum } from '../../../../domain/invitation';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';

@Injectable()
export class InvitationRelationalRepository implements InvitationRepository {
  constructor(
    @InjectRepository(InvitationEntity)
    private readonly repo: Repository<InvitationEntity>,
  ) {}

  async create(data: DeepPartial<Invitation>): Promise<Invitation> {
    const persistenceModel = this.repo.create(
      InvitationMapper.toPersistence(data as Invitation),
    );
    const saved = await this.repo.save(persistenceModel);
    return InvitationMapper.toDomain(saved);
  }

  async findById(id: string): Promise<NullableType<Invitation>> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['tenant'],
    });
    return entity ? InvitationMapper.toDomain(entity) : null;
  }

  async findByEmail(
    email: string,
    tenantId: string,
  ): Promise<Invitation[]> {
    const entities = await this.repo.find({
      where: { email, tenantId },
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
    });
    return entities.map(InvitationMapper.toDomain);
  }

  async findPendingByEmail(
    email: string,
    tenantId: string,
  ): Promise<NullableType<Invitation>> {
    const entity = await this.repo.findOne({
      where: {
        email,
        tenantId,
        status: InvitationStatusEnum.pending,
      },
      relations: ['tenant'],
    });
    return entity ? InvitationMapper.toDomain(entity) : null;
  }

  async findAllByTenant(tenantId: string): Promise<Invitation[]> {
    const entities = await this.repo.find({
      where: { tenantId },
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
    });
    return entities.map(InvitationMapper.toDomain);
  }

  async updateStatus(
    id: string,
    status: InvitationStatusEnum,
  ): Promise<void> {
    await this.repo.update(id, { status });
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
