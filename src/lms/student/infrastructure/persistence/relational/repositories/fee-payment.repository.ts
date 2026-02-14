import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeePaymentEntity } from '../entities/fee-payment.entity';
import { FeePaymentRepository } from '../../fee-payment.repository';
import { FeePaymentMapper } from '../mappers/fee-payment.mapper';
import { FeePayment } from '../../../../domain/fee-payment';
import { NullableType } from '../../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class FeePaymentRelationalRepository implements FeePaymentRepository {
  constructor(
    @InjectRepository(FeePaymentEntity)
    private readonly repo: Repository<FeePaymentEntity>,
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
    data: Omit<FeePayment, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<FeePayment> {
    const persistenceModel = this.repo.create(
      FeePaymentMapper.toPersistence(data as FeePayment),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId = this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return FeePaymentMapper.toDomain(saved);
  }

  async findAll(): Promise<FeePayment[]> {
    const entities = await this.repo.find({ where: { ...this.getTenantFilter() } as any });
    return entities.map(FeePaymentMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<FeePayment>> {
    const entity = await this.repo.findOne({ where: { id, ...this.getTenantFilter() } as any });
    return entity ? FeePaymentMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<FeePayment>,
  ): Promise<FeePayment | null> {
    const entity = await this.repo.findOne({ where: { id, ...this.getTenantFilter() } as any });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        FeePaymentMapper.toPersistence({
          ...FeePaymentMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return FeePaymentMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }

  // ── Extended methods for Fee Management ──

  async findByChallanId(challanId: number): Promise<FeePayment[]> {
    const entities = await this.repo.find({
      where: { feeChallan: { id: challanId }, ...this.getTenantFilter() } as any,
    });
    return entities.map(FeePaymentMapper.toDomain);
  }
}
