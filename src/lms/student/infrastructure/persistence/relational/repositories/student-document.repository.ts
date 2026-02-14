import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentDocumentEntity } from '../entities/student-document.entity';
import { StudentDocumentRepository } from '../../student-document.repository';
import { StudentDocumentMapper } from '../mappers/student-document.mapper';
import { StudentDocument } from '../../../../domain/student-document';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class StudentDocumentRelationalRepository
  implements StudentDocumentRepository
{
  constructor(
    @InjectRepository(StudentDocumentEntity)
    private readonly repo: Repository<StudentDocumentEntity>,
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
    data: Omit<StudentDocument, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<StudentDocument> {
    const persistenceModel = this.repo.create(
      StudentDocumentMapper.toPersistence(data as StudentDocument),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return StudentDocumentMapper.toDomain(saved);
  }

  async findAll(): Promise<StudentDocument[]> {
    const entities = await this.repo.find({ where: { ...this.getTenantFilter() } as any });
    return entities.map(StudentDocumentMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<StudentDocument>> {
    const entity = await this.repo.findOne({ where: { id, ...this.getTenantFilter() } as any });
    return entity ? StudentDocumentMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<StudentDocument>,
  ): Promise<StudentDocument | null> {
    const entity = await this.repo.findOne({ where: { id, ...this.getTenantFilter() } as any });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        StudentDocumentMapper.toPersistence({
          ...StudentDocumentMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return StudentDocumentMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
