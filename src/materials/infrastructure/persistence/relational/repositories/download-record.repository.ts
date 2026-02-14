import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DownloadRecordEntity } from '../entities/download-record.entity';
import { DownloadRecordRepository } from '../../download-record.repository';
import { DownloadRecordMapper } from '../mappers/download-record.mapper';
import { DownloadRecord } from '../../../../domain/download-record';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class DownloadRecordRelationalRepository
  implements DownloadRecordRepository
{
  constructor(
    @InjectRepository(DownloadRecordEntity)
    private readonly repo: Repository<DownloadRecordEntity>,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(
    data: Omit<DownloadRecord, 'id'>,
  ): Promise<DownloadRecord> {
    const persistenceModel = this.repo.create(
      DownloadRecordMapper.toPersistence(data as DownloadRecord),
    );
    if (this.tenantContext.hasContext()) {
      persistenceModel.tenantId = this.tenantContext.getTenantId();
    }
    const saved = await this.repo.save(persistenceModel);
    return DownloadRecordMapper.toDomain(saved);
  }

  async findByMaterialId(materialId: number): Promise<DownloadRecord[]> {
    const tenantId = this.tenantContext.hasContext()
      ? this.tenantContext.getTenantId()
      : undefined;
    const where: any = { materialId };
    if (tenantId) where.tenantId = tenantId;

    const entities = await this.repo.find({ where });
    return entities.map(DownloadRecordMapper.toDomain);
  }

  async countByMaterialId(materialId: number): Promise<number> {
    const tenantId = this.tenantContext.hasContext()
      ? this.tenantContext.getTenantId()
      : undefined;
    const where: any = { materialId };
    if (tenantId) where.tenantId = tenantId;

    return this.repo.count({ where });
  }
}
