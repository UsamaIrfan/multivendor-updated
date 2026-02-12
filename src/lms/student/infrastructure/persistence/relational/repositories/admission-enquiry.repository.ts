import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdmissionEnquiryEntity } from '../entities/admission-enquiry.entity';
import { AdmissionEnquiryRepository } from '../../admission-enquiry.repository';
import { AdmissionEnquiryMapper } from '../mappers/admission-enquiry.mapper';
import { AdmissionEnquiry } from '../../../../domain/admission-enquiry';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class AdmissionEnquiryRelationalRepository
  implements AdmissionEnquiryRepository
{
  constructor(
    @InjectRepository(AdmissionEnquiryEntity)
    private readonly repo: Repository<AdmissionEnquiryEntity>,
  ) {}

  async create(
    data: Omit<
      AdmissionEnquiry,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
    >,
  ): Promise<AdmissionEnquiry> {
    const persistenceModel = this.repo.create(
      AdmissionEnquiryMapper.toPersistence(data as AdmissionEnquiry),
    );
    const saved = await this.repo.save(persistenceModel);
    return AdmissionEnquiryMapper.toDomain(saved);
  }

  async findAll(): Promise<AdmissionEnquiry[]> {
    const entities = await this.repo.find();
    return entities.map(AdmissionEnquiryMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<AdmissionEnquiry>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? AdmissionEnquiryMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<AdmissionEnquiry>,
  ): Promise<AdmissionEnquiry | null> {
    const entity = await this.repo.findOne({ where: { id } });
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
    await this.repo.softDelete(id);
  }
}
