import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimetableEntity } from '../entities/timetable.entity';
import { Timetable } from '../../../../domain/timetable';
import { TimetableRepository } from '../../timetable.repository';
import { TimetableMapper } from '../mappers/timetable.mapper';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class TimetableRelationalRepository implements TimetableRepository {
  constructor(
    @InjectRepository(TimetableEntity)
    private readonly repo: Repository<TimetableEntity>,
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

  async create(data: DeepPartial<Timetable>): Promise<Timetable> {
    const entity = this.repo.create(
      TimetableMapper.toPersistence(data as Timetable),
    );
    if (this.tenantContext.hasContext()) {
      entity.tenantId = this.tenantContext.getTenantId();
      entity.branchId =
        (data as any).branchId ?? this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(entity);
    return TimetableMapper.toDomain(saved);
  }

  async findAll(): Promise<Timetable[]> {
    const tenantFilter = this.getTenantFilter();
    const entities = await this.repo.find({
      where: tenantFilter as any,
      order: { createdAt: 'DESC' },
    });
    return entities.map(TimetableMapper.toDomain);
  }

  async findById(id: string): Promise<NullableType<Timetable>> {
    const tenantFilter = this.getTenantFilter();
    const entity = await this.repo.findOne({
      where: { id, ...tenantFilter } as any,
    });
    return entity ? TimetableMapper.toDomain(entity) : null;
  }

  async findByBranch(branchId: string): Promise<Timetable[]> {
    const tenantId = this.tenantContext.hasContext()
      ? this.tenantContext.getTenantId()
      : undefined;
    const where: Record<string, unknown> = { branchId };
    if (tenantId) where.tenantId = tenantId;
    const entities = await this.repo.find({
      where: where as any,
      order: { createdAt: 'DESC' },
    });
    return entities.map(TimetableMapper.toDomain);
  }

  async update(
    id: string,
    data: DeepPartial<Timetable>,
  ): Promise<Timetable | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? TimetableMapper.toDomain(entity) : null;
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
