import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentAttendanceEntity } from '../entities/student-attendance.entity';
import { StudentAttendanceRepository } from '../../student-attendance.repository';
import { StudentAttendanceMapper } from '../mappers/student-attendance.mapper';
import { StudentAttendance } from '../../../../domain/student-attendance';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class StudentAttendanceRelationalRepository
  implements StudentAttendanceRepository
{
  constructor(
    @InjectRepository(StudentAttendanceEntity)
    private readonly repo: Repository<StudentAttendanceEntity>,
  ) {}

  async create(
    data: Omit<
      StudentAttendance,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
    >,
  ): Promise<StudentAttendance> {
    const persistenceModel = this.repo.create(
      StudentAttendanceMapper.toPersistence(data as StudentAttendance),
    );
    const saved = await this.repo.save(persistenceModel);
    return StudentAttendanceMapper.toDomain(saved);
  }

  async findAll(): Promise<StudentAttendance[]> {
    const entities = await this.repo.find();
    return entities.map(StudentAttendanceMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<StudentAttendance>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? StudentAttendanceMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<StudentAttendance>,
  ): Promise<StudentAttendance | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    const updated = await this.repo.save(
      this.repo.create(
        StudentAttendanceMapper.toPersistence({
          ...StudentAttendanceMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return StudentAttendanceMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
