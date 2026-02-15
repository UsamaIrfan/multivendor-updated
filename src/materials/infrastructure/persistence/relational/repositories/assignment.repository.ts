import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssignmentEntity } from '../entities/assignment.entity';
import { AssignmentRepository } from '../../assignment.repository';
import { AssignmentMapper } from '../mappers/assignment.mapper';
import { Assignment } from '../../../../domain/assignment';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class AssignmentRelationalRepository implements AssignmentRepository {
  constructor(
    @InjectRepository(AssignmentEntity)
    private readonly repo: Repository<AssignmentEntity>,
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
    data: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Assignment> {
    const persistenceModel = this.repo.create(
      AssignmentMapper.toPersistence(data as Assignment),
    );
    if (this.tenantContext.hasContext()) {
      persistenceModel.tenantId = this.tenantContext.getTenantId();
      persistenceModel.branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return AssignmentMapper.toDomain(saved);
  }

  async findAll(): Promise<Assignment[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(AssignmentMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<Assignment>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? AssignmentMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<Assignment>,
  ): Promise<Assignment | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    if (!entity) return null;

    const updated = await this.repo.save(
      this.repo.create(
        AssignmentMapper.toPersistence({
          ...AssignmentMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return AssignmentMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
