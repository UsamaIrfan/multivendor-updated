import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { PeriodEntity } from '../entities/period.entity';
import { Period } from '../../../../domain/period';
import {
  ConflictCheckOptions,
  PeriodRepository,
} from '../../period.repository';
import { PeriodMapper } from '../mappers/period.mapper';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class PeriodRelationalRepository implements PeriodRepository {
  constructor(
    @InjectRepository(PeriodEntity)
    private readonly repo: Repository<PeriodEntity>,
    private readonly tenantContext: TenantContextService,
  ) {}

  private getTenantFilter(): Record<string, unknown> {
    if (this.tenantContext.hasContext()) {
      const filter: Record<string, unknown> = {
        tenantId: this.tenantContext.getTenantId(),
      };
      return filter;
    }
    return {};
  }

  async create(data: DeepPartial<Period>): Promise<Period> {
    const entity = this.repo.create(PeriodMapper.toPersistence(data as Period));
    if (this.tenantContext.hasContext()) {
      entity.tenantId = this.tenantContext.getTenantId();
      entity.branchId =
        (data as any).branchId ?? this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(entity);
    return PeriodMapper.toDomain(saved);
  }

  async findAll(): Promise<Period[]> {
    const tenantFilter = this.getTenantFilter();
    const entities = await this.repo.find({
      where: tenantFilter as any,
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
    return entities.map(PeriodMapper.toDomain);
  }

  async findById(id: string): Promise<NullableType<Period>> {
    const tenantFilter = this.getTenantFilter();
    const entity = await this.repo.findOne({
      where: { id, ...tenantFilter } as any,
    });
    return entity ? PeriodMapper.toDomain(entity) : null;
  }

  async findByTimetable(timetableId: string): Promise<Period[]> {
    const tenantFilter = this.getTenantFilter();
    const entities = await this.repo.find({
      where: { timetableId, ...tenantFilter } as any,
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
    return entities.map(PeriodMapper.toDomain);
  }

  async findConflicts(options: ConflictCheckOptions): Promise<Period[]> {
    const qb = this.repo.createQueryBuilder('period');
    qb.where('period.tenantId = :tenantId', { tenantId: options.tenantId });
    qb.andWhere('period.teacherId = :teacherId', {
      teacherId: options.teacherId,
    });
    qb.andWhere('period.dayOfWeek = :dayOfWeek', {
      dayOfWeek: options.dayOfWeek,
    });

    // Time overlap: existing.start < new.end AND existing.end > new.start
    qb.andWhere(
      new Brackets((sub) => {
        sub
          .where('period.startTime < :endTime', { endTime: options.endTime })
          .andWhere('period.endTime > :startTime', {
            startTime: options.startTime,
          });
      }),
    );

    if (options.excludePeriodId) {
      qb.andWhere('period.id != :excludeId', {
        excludeId: options.excludePeriodId,
      });
    }

    const entities = await qb.getMany();
    return entities.map(PeriodMapper.toDomain);
  }

  async findRoomConflicts(
    tenantId: string,
    branchId: string,
    room: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludePeriodId?: string,
  ): Promise<Period[]> {
    const qb = this.repo.createQueryBuilder('period');
    qb.where('period.tenantId = :tenantId', { tenantId });
    qb.andWhere('period.branchId = :branchId', { branchId });
    qb.andWhere('period.room = :room', { room });
    qb.andWhere('period.dayOfWeek = :dayOfWeek', { dayOfWeek });
    qb.andWhere(
      new Brackets((sub) => {
        sub
          .where('period.startTime < :endTime', { endTime })
          .andWhere('period.endTime > :startTime', { startTime });
      }),
    );

    if (excludePeriodId) {
      qb.andWhere('period.id != :excludeId', { excludeId: excludePeriodId });
    }

    const entities = await qb.getMany();
    return entities.map(PeriodMapper.toDomain);
  }

  async update(id: string, data: DeepPartial<Period>): Promise<Period | null> {
    await this.repo.update(id, data as any);
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? PeriodMapper.toDomain(entity) : null;
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
