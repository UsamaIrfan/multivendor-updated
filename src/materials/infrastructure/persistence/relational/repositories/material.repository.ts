import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { MaterialEntity } from '../entities/material.entity';
import {
  CourseMaterialRepository,
  MaterialFilterOptions,
} from '../../course-material.repository';
import { MaterialMapper } from '../mappers/material.mapper';
import { CourseMaterial } from '../../../../domain/course-material';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class MaterialRelationalRepository implements CourseMaterialRepository {
  constructor(
    @InjectRepository(MaterialEntity)
    private readonly repo: Repository<MaterialEntity>,
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
    data: Omit<CourseMaterial, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<CourseMaterial> {
    const persistenceModel = this.repo.create(
      MaterialMapper.toPersistence(data as CourseMaterial),
    );
    if (this.tenantContext.hasContext()) {
      persistenceModel.tenantId = this.tenantContext.getTenantId();
      persistenceModel.branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return MaterialMapper.toDomain(saved);
  }

  async findAll(): Promise<CourseMaterial[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(MaterialMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<CourseMaterial>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? MaterialMapper.toDomain(entity) : null;
  }

  async findByFilters(filters: MaterialFilterOptions): Promise<CourseMaterial[]> {
    const where: any = { tenantId: filters.tenantId };

    // Branch filtering: include tenant-wide (null) + branch-specific materials
    if (filters.branchId && filters.includeTenantWide) {
      where.branchId = In([filters.branchId, null]);
    } else if (filters.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters.subjectId) {
      where.subjectId = filters.subjectId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.search) {
      where.title = ILike(`%${filters.search}%`);
    }

    const entities = await this.repo.find({ where });
    return entities.map(MaterialMapper.toDomain);
  }

  async update(
    id: number,
    payload: Partial<CourseMaterial>,
  ): Promise<CourseMaterial | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    if (!entity) return null;

    const updated = await this.repo.save(
      this.repo.create(
        MaterialMapper.toPersistence({
          ...MaterialMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return MaterialMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }

  async calculateUsedStorage(tenantId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('material')
      .select('COALESCE(SUM(material.fileSize), 0)', 'total')
      .where('material.tenantId = :tenantId', { tenantId })
      .andWhere('material.deletedAt IS NULL')
      .getRawOne();

    return parseInt(result?.total || '0', 10);
  }
}
