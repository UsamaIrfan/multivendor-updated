import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TermEntity } from '../entities/term.entity';
import { TermRepository } from '../../term.repository';
import { TermMapper } from '../mappers/term.mapper';
import { Term } from '../../../../domain/term';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class TermRelationalRepository implements TermRepository {
  constructor(
    @InjectRepository(TermEntity)
    private readonly repo: Repository<TermEntity>,
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
    data: Omit<Term, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Term> {
    const persistenceModel = this.repo.create(
      TermMapper.toPersistence(data as Term),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return TermMapper.toDomain(saved);
  }

  async findAll(): Promise<Term[]> {
    const entities = await this.repo.find({ where: { ...this.getTenantFilter() } as any, relations: ['academicYear'] });
    return entities.map(TermMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<Term>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
      relations: ['academicYear'],
    });
    return entity ? TermMapper.toDomain(entity) : null;
  }

  async update(id: number, payload: Partial<Term>): Promise<Term | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
      relations: ['academicYear'],
    });
    if (!entity) return null;

    const updated = await this.repo.save(
      this.repo.create(
        TermMapper.toPersistence({
          ...TermMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return TermMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
