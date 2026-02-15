import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamResultEntity } from '../entities/exam-result.entity';
import { ExamResultRepository } from '../../exam-result.repository';
import { ExamResultMapper } from '../mappers/exam-result.mapper';
import { ExamResult } from '../../../../domain/exam-result';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class ExamResultRelationalRepository implements ExamResultRepository {
  constructor(
    @InjectRepository(ExamResultEntity)
    private readonly repo: Repository<ExamResultEntity>,
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
    data: Omit<ExamResult, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<ExamResult> {
    const persistenceModel = this.repo.create(
      ExamResultMapper.toPersistence(data as ExamResult),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return ExamResultMapper.toDomain(saved);
  }

  async findAll(): Promise<ExamResult[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(ExamResultMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<ExamResult>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? ExamResultMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<ExamResult>,
  ): Promise<ExamResult | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        ExamResultMapper.toPersistence({
          ...ExamResultMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return ExamResultMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }

  async findByExamSubjectId(examSubjectId: number): Promise<ExamResult[]> {
    const entities = await this.repo.find({
      where: {
        examSubject: { id: examSubjectId },
        ...this.getTenantFilter(),
      } as any,
      relations: ['examSubject', 'student'],
    });
    return entities.map(ExamResultMapper.toDomain);
  }

  async findByStudentId(studentId: number): Promise<ExamResult[]> {
    const entities = await this.repo.find({
      where: { student: { id: studentId }, ...this.getTenantFilter() } as any,
      relations: ['examSubject', 'student'],
    });
    return entities.map(ExamResultMapper.toDomain);
  }

  async findByExamSubjectIdAndStudentId(
    examSubjectId: number,
    studentId: number,
  ): Promise<ExamResult | null> {
    const entity = await this.repo.findOne({
      where: {
        examSubject: { id: examSubjectId },
        student: { id: studentId },
        ...this.getTenantFilter(),
      } as any,
      relations: ['examSubject', 'student'],
    });
    return entity ? ExamResultMapper.toDomain(entity) : null;
  }

  async bulkCreate(
    data: Omit<ExamResult, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>[],
  ): Promise<ExamResult[]> {
    const entities = data.map((d) =>
      this.repo.create(ExamResultMapper.toPersistence(d as ExamResult)),
    );
    if (this.tenantContext.hasContext()) {
      entities.forEach((entity) => {
        (entity as any).tenantId = this.tenantContext.getTenantId();
        (entity as any).branchId = this.tenantContext.getBranchId() ?? null;
      });
    }
    const saved = await this.repo.save(entities);
    return saved.map(ExamResultMapper.toDomain);
  }
}
