import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { AuditLogRepository } from '../../audit-log.repository';
import { AuditLogMapper } from '../mappers/audit-log.mapper';
import { AuditLog } from '../../../../domain/audit-log';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';

@Injectable()
export class AuditLogRelationalRepository implements AuditLogRepository {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repo: Repository<AuditLogEntity>,
  ) {}

  async create(data: DeepPartial<AuditLog>): Promise<AuditLog> {
    const entity = this.repo.create(
      AuditLogMapper.toPersistence(data as AuditLog),
    );
    const saved = await this.repo.save(entity);
    return AuditLogMapper.toDomain(saved);
  }

  async findByTenant(
    tenantId: string,
    options?: {
      userId?: number;
      action?: string;
      resourceType?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<AuditLog[]> {
    const qb = this.repo
      .createQueryBuilder('log')
      .where('log.tenantId = :tenantId', { tenantId });

    if (options?.userId) {
      qb.andWhere('log.userId = :userId', { userId: options.userId });
    }
    if (options?.action) {
      qb.andWhere('log.action = :action', { action: options.action });
    }
    if (options?.resourceType) {
      qb.andWhere('log.resourceType = :resourceType', {
        resourceType: options.resourceType,
      });
    }

    qb.orderBy('log.createdAt', 'DESC');

    if (options?.limit) {
      qb.take(options.limit);
    }
    if (options?.offset) {
      qb.skip(options.offset);
    }

    const entities = await qb.getMany();
    return entities.map(AuditLogMapper.toDomain);
  }
}
