import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimetableSlotEntity } from '../entities/timetable-slot.entity';
import { TimetableSlot } from '../../../../domain/timetable-slot';
import { TimetableSlotRepository } from '../../timetable-slot.repository';
import { TimetableSlotMapper } from '../mappers/timetable-slot.mapper';
import { DeepPartial } from '../../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class TimetableSlotRelationalRepository
  implements TimetableSlotRepository
{
  constructor(
    @InjectRepository(TimetableSlotEntity)
    private readonly repo: Repository<TimetableSlotEntity>,
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

  async create(data: DeepPartial<TimetableSlot>): Promise<TimetableSlot> {
    const entity = this.repo.create(
      data as any,
    ) as unknown as TimetableSlotEntity;
    if (this.tenantContext.hasContext()) {
      (entity as any).tenantId = this.tenantContext.getTenantId();
      (entity as any).branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(entity);
    return TimetableSlotMapper.toDomain(saved);
  }

  async findAll(): Promise<TimetableSlot[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(TimetableSlotMapper.toDomain);
  }

  async findById(
    id: TimetableSlot['id'],
  ): Promise<NullableType<TimetableSlot>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? TimetableSlotMapper.toDomain(entity) : null;
  }

  async update(
    id: TimetableSlot['id'],
    data: DeepPartial<TimetableSlot>,
  ): Promise<TimetableSlot | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? TimetableSlotMapper.toDomain(entity) : null;
  }

  async remove(id: TimetableSlot['id']): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
