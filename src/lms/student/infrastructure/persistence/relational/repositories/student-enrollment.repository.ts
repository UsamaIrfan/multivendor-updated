import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEnrollmentEntity } from '../entities/student-enrollment.entity';
import {
  StudentEnrollmentRepository,
  EnrollmentFilter,
} from '../../student-enrollment.repository';
import { StudentEnrollmentMapper } from '../mappers/student-enrollment.mapper';
import { StudentEnrollment } from '../../../../domain/student-enrollment';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class StudentEnrollmentRelationalRepository
  implements StudentEnrollmentRepository
{
  constructor(
    @InjectRepository(StudentEnrollmentEntity)
    private readonly repo: Repository<StudentEnrollmentEntity>,
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
      StudentEnrollment,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
    >,
  ): Promise<StudentEnrollment> {
    const persistenceModel = this.repo.create(
      StudentEnrollmentMapper.toPersistence(data as StudentEnrollment),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return StudentEnrollmentMapper.toDomain(saved);
  }

  async findAll(filter?: EnrollmentFilter): Promise<StudentEnrollment[]> {
    const where: Record<string, unknown> = { ...this.getTenantFilter() };
    if (filter?.sectionId) {
      where.section = { id: filter.sectionId };
    }
    if (filter?.status) {
      where.status = filter.status;
    }
    const entities = await this.repo.find({
      where: where as any,
      relations: ['student', 'student.user'],
    });
    return entities.map(StudentEnrollmentMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<StudentEnrollment>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? StudentEnrollmentMapper.toDomain(entity) : null;
  }

  async findByStudentAndYear(
    studentId: number,
    academicYearId: number,
  ): Promise<StudentEnrollment | null> {
    const entity = await this.repo.findOne({
      where: {
        student: { id: studentId },
        academicYear: { id: academicYearId },
        ...this.getTenantFilter(),
      } as any,
    });
    return entity ? StudentEnrollmentMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<StudentEnrollment>,
  ): Promise<StudentEnrollment | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        StudentEnrollmentMapper.toPersistence({
          ...StudentEnrollmentMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return StudentEnrollmentMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
