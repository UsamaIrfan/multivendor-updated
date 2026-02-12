import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentDocumentEntity } from '../entities/student-document.entity';
import { StudentDocumentRepository } from '../../student-document.repository';
import { StudentDocumentMapper } from '../mappers/student-document.mapper';
import { StudentDocument } from '../../../../domain/student-document';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class StudentDocumentRelationalRepository
  implements StudentDocumentRepository
{
  constructor(
    @InjectRepository(StudentDocumentEntity)
    private readonly repo: Repository<StudentDocumentEntity>,
  ) {}

  async create(
    data: Omit<StudentDocument, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<StudentDocument> {
    const persistenceModel = this.repo.create(
      StudentDocumentMapper.toPersistence(data as StudentDocument),
    );
    const saved = await this.repo.save(persistenceModel);
    return StudentDocumentMapper.toDomain(saved);
  }

  async findAll(): Promise<StudentDocument[]> {
    const entities = await this.repo.find();
    return entities.map(StudentDocumentMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<StudentDocument>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? StudentDocumentMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<StudentDocument>,
  ): Promise<StudentDocument | null> {
    const entity = await this.repo.findOne({ where: { id } });
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
    await this.repo.softDelete(id);
  }
}
