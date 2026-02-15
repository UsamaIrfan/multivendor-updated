import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequestEntity } from '../entities/leave-request.entity';
import { LeaveRequestRepository } from '../../leave-request.repository';
import { LeaveRequestMapper } from '../mappers/leave-request.mapper';
import { LeaveRequest } from '../../../../domain/leave-request';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class LeaveRequestRelationalRepository
  implements LeaveRequestRepository
{
  constructor(
    @InjectRepository(LeaveRequestEntity)
    private readonly repo: Repository<LeaveRequestEntity>,
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
    data: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<LeaveRequest> {
    const persistenceModel = this.repo.create(
      LeaveRequestMapper.toPersistence(data as LeaveRequest),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return LeaveRequestMapper.toDomain(saved);
  }

  async findAll(): Promise<LeaveRequest[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(LeaveRequestMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<LeaveRequest>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? LeaveRequestMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<LeaveRequest>,
  ): Promise<LeaveRequest | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        LeaveRequestMapper.toPersistence({
          ...LeaveRequestMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return LeaveRequestMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
