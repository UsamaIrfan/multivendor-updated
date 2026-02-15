import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssignmentSubmissionEntity } from '../entities/assignment-submission.entity';
import { AssignmentSubmissionRepository } from '../../assignment-submission.repository';
import { AssignmentSubmissionMapper } from '../mappers/assignment-submission.mapper';
import { AssignmentSubmission } from '../../../../domain/assignment-submission';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class AssignmentSubmissionRelationalRepository
  implements AssignmentSubmissionRepository
{
  constructor(
    @InjectRepository(AssignmentSubmissionEntity)
    private readonly repo: Repository<AssignmentSubmissionEntity>,
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
    data: Omit<
      AssignmentSubmission,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
    >,
  ): Promise<AssignmentSubmission> {
    const persistenceModel = this.repo.create(
      AssignmentSubmissionMapper.toPersistence(data as AssignmentSubmission),
    );
    if (this.tenantContext.hasContext()) {
      persistenceModel.tenantId = this.tenantContext.getTenantId();
      persistenceModel.branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return AssignmentSubmissionMapper.toDomain(saved);
  }

  async findAll(): Promise<AssignmentSubmission[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(AssignmentSubmissionMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<AssignmentSubmission>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? AssignmentSubmissionMapper.toDomain(entity) : null;
  }

  async findByAssignmentId(
    assignmentId: number,
  ): Promise<AssignmentSubmission[]> {
    const entities = await this.repo.find({
      where: { assignmentId, ...this.getTenantFilter() } as any,
    });
    return entities.map(AssignmentSubmissionMapper.toDomain);
  }

  async update(
    id: number,
    payload: Partial<AssignmentSubmission>,
  ): Promise<AssignmentSubmission | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    if (!entity) return null;

    const updated = await this.repo.save(
      this.repo.create(
        AssignmentSubmissionMapper.toPersistence({
          ...AssignmentSubmissionMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return AssignmentSubmissionMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
