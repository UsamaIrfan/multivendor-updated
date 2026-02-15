import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamEntity } from '../entities/exam.entity';
import { ExamRepository } from '../../exam.repository';
import { ExamMapper } from '../mappers/exam.mapper';
import { Exam } from '../../../../domain/exam';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { ExamStatusEnum } from '../../../../../common/enums/exam-status.enum';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class ExamRelationalRepository implements ExamRepository {
  constructor(
    @InjectRepository(ExamEntity)
    private readonly repo: Repository<ExamEntity>,
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
    data: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Exam> {
    const persistenceModel = this.repo.create(
      ExamMapper.toPersistence(data as Exam),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return ExamMapper.toDomain(saved);
  }

  async findAll(): Promise<Exam[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(ExamMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<Exam>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? ExamMapper.toDomain(entity) : null;
  }

  async update(id: number, payload: Partial<Exam>): Promise<Exam | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        ExamMapper.toPersistence({
          ...ExamMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return ExamMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }

  async findByTermId(termId: number): Promise<Exam[]> {
    const entities = await this.repo.find({
      where: { term: { id: termId }, ...this.getTenantFilter() } as any,
    });
    return entities.map(ExamMapper.toDomain);
  }

  async findByStatus(status: ExamStatusEnum): Promise<Exam[]> {
    const entities = await this.repo.find({
      where: { status, ...this.getTenantFilter() } as any,
    });
    return entities.map(ExamMapper.toDomain);
  }
}
