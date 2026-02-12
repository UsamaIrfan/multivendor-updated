import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from '../entities/student.entity';
import { StudentRepository } from '../../student.repository';
import { StudentMapper } from '../mappers/student.mapper';
import { Student } from '../../../../domain/student';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class StudentRelationalRepository implements StudentRepository {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly repo: Repository<StudentEntity>,
  ) {}

  async create(
    data: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Student> {
    const persistenceModel = this.repo.create(
      StudentMapper.toPersistence(data as Student),
    );
    const saved = await this.repo.save(persistenceModel);
    return StudentMapper.toDomain(saved);
  }

  async findAll(): Promise<Student[]> {
    const entities = await this.repo.find();
    return entities.map(StudentMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<Student>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? StudentMapper.toDomain(entity) : null;
  }

  async update(id: number, payload: Partial<Student>): Promise<Student | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        StudentMapper.toPersistence({
          ...StudentMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return StudentMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
