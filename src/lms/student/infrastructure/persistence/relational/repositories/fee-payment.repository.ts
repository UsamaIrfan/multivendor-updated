import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeePaymentEntity } from '../entities/fee-payment.entity';
import { FeePaymentRepository } from '../../fee-payment.repository';
import { FeePaymentMapper } from '../mappers/fee-payment.mapper';
import { FeePayment } from '../../../../domain/fee-payment';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class FeePaymentRelationalRepository implements FeePaymentRepository {
  constructor(
    @InjectRepository(FeePaymentEntity)
    private readonly repo: Repository<FeePaymentEntity>,
  ) {}

  async create(
    data: Omit<FeePayment, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<FeePayment> {
    const persistenceModel = this.repo.create(
      FeePaymentMapper.toPersistence(data as FeePayment),
    );
    const saved = await this.repo.save(persistenceModel);
    return FeePaymentMapper.toDomain(saved);
  }

  async findAll(): Promise<FeePayment[]> {
    const entities = await this.repo.find();
    return entities.map(FeePaymentMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<FeePayment>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? FeePaymentMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<FeePayment>,
  ): Promise<FeePayment | null> {
    const entity = await this.repo.findOne({ where: { id } });
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
    await this.repo.softDelete(id);
  }
}
