import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstitutionEntity } from '../entities/institution.entity';
import { InstitutionRepository } from '../../institution.repository';
import { InstitutionMapper } from '../mappers/institution.mapper';
import { Institution } from '../../../../domain/institution';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class InstitutionRelationalRepository implements InstitutionRepository {
  constructor(
    @InjectRepository(InstitutionEntity)
    private readonly repo: Repository<InstitutionEntity>,
    private readonly tenantContext: TenantContextService,
  ) {}

  private getTenantFilter(): Record<string, unknown> {
    if (this.tenantContext.hasContext()) {
      const filter: Record<string, unknown> = {
        tenantId: this.tenantContext.getTenantId(),
      };
      const branchId = this.tenantContext.getBranchId();
      if (branchId) filter.branchId = branchId;
      return filter;
    }
    return {};
  }

  async create(
    data: Omit<Institution, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Institution> {
    const persistenceModel = this.repo.create(
      InstitutionMapper.toPersistence(data as Institution),
    );
    const saved = await this.repo.save(persistenceModel);
    return InstitutionMapper.toDomain(saved);
  }

  async findAll(): Promise<Institution[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(InstitutionMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<Institution>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? InstitutionMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<Institution>,
  ): Promise<Institution | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    if (!entity) return null;

    const updated = await this.repo.save(
      this.repo.create(
        InstitutionMapper.toPersistence({
          ...InstitutionMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return InstitutionMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
