import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectionEntity } from '../entities/section.entity';
import { SectionRepository } from '../../section.repository';
import { SectionMapper } from '../mappers/section.mapper';
import { Section } from '../../../../domain/section';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class SectionRelationalRepository implements SectionRepository {
  constructor(
    @InjectRepository(SectionEntity)
    private readonly repo: Repository<SectionEntity>,
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
    data: Omit<Section, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Section> {
    const persistenceModel = this.repo.create(
      SectionMapper.toPersistence(data as Section),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return SectionMapper.toDomain(saved);
  }

  async findAll(): Promise<Section[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
      relations: ['gradeClass'],
    });
    return entities.map(SectionMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<Section>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
      relations: ['gradeClass'],
    });
    return entity ? SectionMapper.toDomain(entity) : null;
  }

  async update(id: number, payload: Partial<Section>): Promise<Section | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
      relations: ['gradeClass'],
    });
    if (!entity) return null;

    const updated = await this.repo.save(
      this.repo.create(
        SectionMapper.toPersistence({
          ...SectionMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return SectionMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
