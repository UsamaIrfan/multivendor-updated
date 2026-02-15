import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentEntity } from '../entities/department.entity';
import { DepartmentRepository } from '../../department.repository';
import { DepartmentMapper } from '../mappers/department.mapper';
import { Department } from '../../../../domain/department';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class DepartmentRelationalRepository implements DepartmentRepository {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly repo: Repository<DepartmentEntity>,
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
    data: Omit<Department, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Department> {
    const persistenceModel = this.repo.create(
      DepartmentMapper.toPersistence(data as Department),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return DepartmentMapper.toDomain(saved);
  }

  async findAll(): Promise<Department[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
      relations: ['institution'],
    });
    return entities.map(DepartmentMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<Department>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
      relations: ['institution'],
    });
    return entity ? DepartmentMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<Department>,
  ): Promise<Department | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
      relations: ['institution'],
    });
    if (!entity) return null;

    const updated = await this.repo.save(
      this.repo.create(
        DepartmentMapper.toPersistence({
          ...DepartmentMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return DepartmentMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
