import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReceiptEntity } from '../entities/receipt.entity';
import { ReceiptRepository } from '../../receipt.repository';
import { ReceiptMapper } from '../mappers/receipt.mapper';
import { Receipt } from '../../../../domain/receipt';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { TenantContextService } from '../../../../../tenant/tenant-context/tenant-context.service';

@Injectable()
export class ReceiptRelationalRepository implements ReceiptRepository {
  constructor(
    @InjectRepository(ReceiptEntity)
    private readonly repo: Repository<ReceiptEntity>,
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
    data: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Receipt> {
    const persistenceModel = this.repo.create(
      ReceiptMapper.toPersistence(data as Receipt),
    );
    if (this.tenantContext.hasContext()) {
      (persistenceModel as any).tenantId = this.tenantContext.getTenantId();
      (persistenceModel as any).branchId =
        this.tenantContext.getBranchId() ?? null;
    }
    const saved = await this.repo.save(persistenceModel);
    return ReceiptMapper.toDomain(saved);
  }

  async findAll(): Promise<Receipt[]> {
    const entities = await this.repo.find({
      where: { ...this.getTenantFilter() } as any,
      relations: ['payment'],
    });
    return entities.map(ReceiptMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<Receipt>> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
      relations: ['payment'],
    });
    return entity ? ReceiptMapper.toDomain(entity) : null;
  }

  async update(id: number, payload: Partial<Receipt>): Promise<Receipt | null> {
    const entity = await this.repo.findOne({
      where: { id, ...this.getTenantFilter() } as any,
    });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        ReceiptMapper.toPersistence({
          ...ReceiptMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return ReceiptMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete({ id, ...this.getTenantFilter() } as any);
  }

  async getNextReceiptNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `REC-${currentYear}-`;

    const qb = this.repo
      .createQueryBuilder('receipt')
      .where('receipt.receiptNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('receipt.receiptNumber', 'DESC');
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter.tenantId) {
      qb.andWhere('receipt.tenantId = :tenantId', {
        tenantId: tenantFilter.tenantId,
      });
      if (tenantFilter.branchId) {
        qb.andWhere('receipt.branchId = :branchId', {
          branchId: tenantFilter.branchId,
        });
      }
    }
    const last = await qb.getOne();

    let nextSeq = 1;
    if (last) {
      const parts = last.receiptNumber.split('-');
      nextSeq = parseInt(parts[2], 10) + 1;
    }

    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
  }
}
