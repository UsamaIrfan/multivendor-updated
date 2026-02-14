import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYearEntity } from '../entities/academic-year.entity';
import { AcademicYearRepository } from '../../academic-year.repository';
import { AcademicYearMapper } from '../mappers/academic-year.mapper';
import { AcademicYear } from '../../../../domain/academic-year';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class AcademicYearRelationalRepository
  implements AcademicYearRepository
{
  constructor(
    @InjectRepository(AcademicYearEntity)
    private readonly repo: Repository<AcademicYearEntity>,
    private readonly tenantContext: TenantContextService,
  ) {}

  private getTenantFilter(): Record<string, unknown> {
    if (this.tenantContext.hasContext()) {
      const filter: Record<string, unknown> = { tenantId: this.tenantContext.getTenantId() };
      const branchId = this.tenantContext.getBranchId();
      if (branchId) filter.branchId = branchId;
      return filter;
    }
    return {};
  }

  async create(
    data: Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<AcademicYear> {
    const persistenceModel = this.repo.create(
      AcademicYearMapper.toPersistence(data as AcademicYear),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return AcademicYearMapper.toDomain(saved);
  }

  async findAll(): Promise<AcademicYear[]> {
    const entities = await this.repo.find({ where: { ...this.getTenantFilter() } as any, relations: ['institution'] });
    return entities.map(AcademicYearMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<AcademicYear>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
      relations: ['institution'],
    });
    return entity ? AcademicYearMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<AcademicYear>,
  ): Promise<AcademicYear | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
      relations: ['institution'],
    });
    if (!entity) return null;

    const updated = await this.repo.save(
      this.repo.create(
        AcademicYearMapper.toPersistence({
          ...AcademicYearMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return AcademicYearMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
