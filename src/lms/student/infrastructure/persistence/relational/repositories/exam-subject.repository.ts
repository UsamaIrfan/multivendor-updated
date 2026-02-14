import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamSubjectEntity } from '../entities/exam-subject.entity';
import { ExamSubjectRepository } from '../../exam-subject.repository';
import { ExamSubjectMapper } from '../mappers/exam-subject.mapper';
import { ExamSubject } from '../../../../domain/exam-subject';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class ExamSubjectRelationalRepository implements ExamSubjectRepository {
  constructor(
    @InjectRepository(ExamSubjectEntity)
    private readonly repo: Repository<ExamSubjectEntity>,
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
    data: Omit<ExamSubject, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<ExamSubject> {
    const persistenceModel = this.repo.create(
      ExamSubjectMapper.toPersistence(data as ExamSubject),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return ExamSubjectMapper.toDomain(saved);
  }

  async findAll(): Promise<ExamSubject[]> {
    const entities = await this.repo.find({ where: { ...this.getTenantFilter() } as any });
    return entities.map(ExamSubjectMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<ExamSubject>> {
    const entity = await this.repo.findOne({ where: { id, ...this.getTenantFilter() } as any });
    return entity ? ExamSubjectMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<ExamSubject>,
  ): Promise<ExamSubject | null> {
    const entity = await this.repo.findOne({ where: { id, ...this.getTenantFilter() } as any });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        ExamSubjectMapper.toPersistence({
          ...ExamSubjectMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return ExamSubjectMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }

  async findByExamId(examId: number): Promise<ExamSubject[]> {
    const entities = await this.repo.find({
      where: { exam: { id: examId }, ...this.getTenantFilter() } as any,
    });
    return entities.map(ExamSubjectMapper.toDomain);
  }
}
