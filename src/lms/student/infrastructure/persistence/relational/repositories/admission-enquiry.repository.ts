import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdmissionEnquiryEntity } from '../entities/admission-enquiry.entity';
import { AdmissionEnquiryRepository } from '../../admission-enquiry.repository';
import { AdmissionEnquiryMapper } from '../mappers/admission-enquiry.mapper';
import { AdmissionEnquiry } from '../../../../domain/admission-enquiry';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class AdmissionEnquiryRelationalRepository
  implements AdmissionEnquiryRepository
{
  constructor(
    @InjectRepository(AdmissionEnquiryEntity)
    private readonly repo: Repository<AdmissionEnquiryEntity>,
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
      AdmissionEnquiry,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
    >,
  ): Promise<AdmissionEnquiry> {
    const persistenceModel = this.repo.create(
      AdmissionEnquiryMapper.toPersistence(data as AdmissionEnquiry),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return AdmissionEnquiryMapper.toDomain(saved);
  }

  async findAll(): Promise<AdmissionEnquiry[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
    });
    return entities.map(AdmissionEnquiryMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<AdmissionEnquiry>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    return entity ? AdmissionEnquiryMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<AdmissionEnquiry>,
  ): Promise<AdmissionEnquiry | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        AdmissionEnquiryMapper.toPersistence({
          ...AdmissionEnquiryMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return AdmissionEnquiryMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }
}
