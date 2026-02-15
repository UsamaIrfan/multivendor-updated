import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentGuardianEntity } from '../entities/student-guardian.entity';
import { StudentGuardianRepository } from '../../student-guardian.repository';
import { StudentGuardianMapper } from '../mappers/student-guardian.mapper';
import { StudentGuardian } from '../../../../domain/student-guardian';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class StudentGuardianRelationalRepository
  implements StudentGuardianRepository
{
  constructor(
    @InjectRepository(StudentGuardianEntity)
    private readonly repo: Repository<StudentGuardianEntity>,
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
    data: Omit<StudentGuardian, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<StudentGuardian> {
    const persistenceModel = this.repo.create(
      StudentGuardianMapper.toPersistence(data as StudentGuardian),
    );
    // Set student relation via the student id
    if ((data as any).studentId) {
      (persistenceModel as any).student = { id: (data as any).studentId };
    }
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    // Re-fetch with relations to get studentId
    const full = await this.repo.findOne({
      where: { id: saved.id, ...this.getTenantFilter() } as any,
      relations: ['student'],
    });
    return StudentGuardianMapper.toDomain(full || saved);
  }

  async findAll(): Promise<StudentGuardian[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
      relations: ['student'],
    });
    return entities.map(StudentGuardianMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<StudentGuardian>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
      relations: ['student'],
    });
    return entity ? StudentGuardianMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<StudentGuardian>,
  ): Promise<StudentGuardian | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
      relations: ['student'],
    });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        StudentGuardianMapper.toPersistence({
          ...StudentGuardianMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    const full = await this.repo.findOne({
      where: { id: updated.id, ...this.getTenantFilter() } as any,
      relations: ['student'],
    });
    return StudentGuardianMapper.toDomain(full || updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
