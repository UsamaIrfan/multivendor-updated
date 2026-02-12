import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEnrollmentEntity } from '../entities/student-enrollment.entity';
import { StudentEnrollmentRepository } from '../../student-enrollment.repository';
import { StudentEnrollmentMapper } from '../mappers/student-enrollment.mapper';
import { StudentEnrollment } from '../../../../domain/student-enrollment';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class StudentEnrollmentRelationalRepository
  implements StudentEnrollmentRepository
{
  constructor(
    @InjectRepository(StudentEnrollmentEntity)
    private readonly repo: Repository<StudentEnrollmentEntity>,
  ) {}

  async create(
    data: Omit<
      StudentEnrollment,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
    >,
  ): Promise<StudentEnrollment> {
    const persistenceModel = this.repo.create(
      StudentEnrollmentMapper.toPersistence(data as StudentEnrollment),
    );
    const saved = await this.repo.save(persistenceModel);
    return StudentEnrollmentMapper.toDomain(saved);
  }

  async findAll(): Promise<StudentEnrollment[]> {
    const entities = await this.repo.find();
    return entities.map(StudentEnrollmentMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<StudentEnrollment>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? StudentEnrollmentMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<StudentEnrollment>,
  ): Promise<StudentEnrollment | null> {
    const entity = await this.repo.findOne({ where: { id } });
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
    await this.repo.softDelete(id);
  }
}
