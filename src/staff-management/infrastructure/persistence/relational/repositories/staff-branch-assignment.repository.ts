import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffBranchAssignmentEntity } from '../entities/staff-branch-assignment.entity';
import { StaffBranchAssignment } from '../../../../domain/staff-branch-assignment';
import { StaffBranchAssignmentRepository } from '../../staff-branch-assignment.repository';
import { StaffBranchAssignmentMapper } from '../mappers/staff-branch-assignment.mapper';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class StaffBranchAssignmentRelationalRepository
  implements StaffBranchAssignmentRepository
{
  constructor(
    @InjectRepository(StaffBranchAssignmentEntity)
    private readonly repo: Repository<StaffBranchAssignmentEntity>,
    private readonly tenantContext: TenantContextService,
  ) {}

  private getTenantFilter(): Record<string, unknown> {
    if (this.tenantContext.hasContext()) {
      return { tenantId: this.tenantContext.getTenantId() };
    }
    return {};
  }

  async create(
    data: DeepPartial<StaffBranchAssignment>,
  ): Promise<StaffBranchAssignment> {
    const entity = this.repo.create(
      data as any,
    ) as unknown as StaffBranchAssignmentEntity;
    if (this.tenantContext.hasContext()) {
      (entity as any).tenantId = this.tenantContext.getTenantId();
    }
    const saved = await this.repo.save(entity);
    return StaffBranchAssignmentMapper.toDomain(saved);
  }

  async findAll(): Promise<StaffBranchAssignment[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(StaffBranchAssignmentMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<StaffBranchAssignment>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? StaffBranchAssignmentMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    data: DeepPartial<StaffBranchAssignment>,
  ): Promise<StaffBranchAssignment | null> {
    await this.repo.update(id, data as any);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete({ id, ...this.getTenantFilter() } as any);
  }

  async findByStaffId(staffEntityId: number): Promise<StaffBranchAssignment[]> {
    const entities = await this.repo.find({
      where: {
        staffEntityId,
        ...this.getTenantFilter(),
      } as any,
    });
    return entities.map(StaffBranchAssignmentMapper.toDomain);
  }

  async findByStaffAndBranch(
    staffEntityId: number,
    branchId: string,
  ): Promise<NullableType<StaffBranchAssignment>> {
    const entity = await this.repo.findOne({
      where: {
        staffEntityId,
        branchId,
        ...this.getTenantFilter(),
      } as any,
    });
    return entity ? StaffBranchAssignmentMapper.toDomain(entity) : null;
  }

  async updatePrimaryFlag(
    staffEntityId: number,
    branchId: string,
    isPrimary: boolean,
  ): Promise<void> {
    if (isPrimary) {
      // Reset all assignments for this staff to non-primary
      await this.repo.update(
        {
          staffEntityId,
          ...this.getTenantFilter(),
        } as any,
        { isPrimary: false },
      );
    }
    // Set the target assignment as primary
    await this.repo.update(
      {
        staffEntityId,
        branchId,
        ...this.getTenantFilter(),
      } as any,
      { isPrimary },
    );
  }

  async findByUserAndTenant(
    userId: number,
    tenantId: string,
  ): Promise<StaffBranchAssignment[]> {
    const entities = await this.repo
      .createQueryBuilder('assignment')
      .innerJoin('assignment.staff', 'staff')
      .where('staff.userId = :userId', { userId })
      .andWhere('assignment.tenantId = :tenantId', { tenantId })
      .getMany();
    return entities.map(StaffBranchAssignmentMapper.toDomain);
  }
}
