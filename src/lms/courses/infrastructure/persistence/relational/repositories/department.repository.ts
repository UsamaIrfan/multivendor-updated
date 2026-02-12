import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentEntity } from '../entities/department.entity';
import { DepartmentRepository } from '../../department.repository';
import { DepartmentMapper } from '../mappers/department.mapper';
import { Department } from '../../../../domain/department';
import { NullableType } from '../../../../../../utils/types/nullable.type';

@Injectable()
export class DepartmentRelationalRepository implements DepartmentRepository {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly repo: Repository<DepartmentEntity>,
  ) {}

  async create(
    data: Omit<Department, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Department> {
    const persistenceModel = this.repo.create(
      DepartmentMapper.toPersistence(data as Department),
    );
    const saved = await this.repo.save(persistenceModel);
    return DepartmentMapper.toDomain(saved);
  }

  async findAll(): Promise<Department[]> {
    const entities = await this.repo.find({ relations: ['institution'] });
    return entities.map(DepartmentMapper.toDomain);
  }

  async findById(id: number): Promise<NullableType<Department>> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['institution'],
    });
    return entity ? DepartmentMapper.toDomain(entity) : null;
  }

  async update(
    id: number,
    payload: Partial<Department>,
  ): Promise<Department | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['institution'],
    });
    if (!entity) return null;

    const updated = await this.repo.save(
      this.repo.create(
        DepartmentMapper.toPersistence({
          ...DepartmentMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );
    return DepartmentMapper.toDomain(updated);
  }

  async remove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
