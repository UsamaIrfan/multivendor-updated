import { Injectable, NotFoundException } from '@nestjs/common';
import { AcademicYearRepository } from './infrastructure/persistence/academic-year.repository';
import { TermRepository } from './infrastructure/persistence/term.repository';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { AcademicYear } from './domain/academic-year';
import { NullableType } from '../../utils/types/nullable.type';

@Injectable()
export class AcademicService {
  constructor(
    private readonly academicYearRepository: AcademicYearRepository,
    private readonly termRepository: TermRepository,
  ) {}

  // ─── Academic Year ────────────────────────────────────
  createAcademicYear(dto: CreateAcademicYearDto): Promise<AcademicYear> {
    return this.academicYearRepository.create(dto);
  }

  findAllAcademicYears() {
    return this.academicYearRepository.findAll();
  }

  async findOneAcademicYear(id: number) {
    const academicYear = await this.academicYearRepository.findById(id);
    if (!academicYear) throw new NotFoundException('Academic year not found');
    return academicYear;
  }

  async updateAcademicYear(
    id: number,
    dto: UpdateAcademicYearDto,
  ): Promise<NullableType<AcademicYear>> {
    await this.findOneAcademicYear(id);
    return this.academicYearRepository.update(id, dto);
  }

  async removeAcademicYear(id: number): Promise<void> {
    await this.findOneAcademicYear(id);
    return this.academicYearRepository.remove(id);
  }

  // ─── Term ─────────────────────────────────────────────
  async createTerm(dto: CreateTermDto) {
    await this.findOneAcademicYear(dto.academicYearId);
    return this.termRepository.create(dto);
  }

  findAllTerms() {
    return this.termRepository.findAll();
  }

  async findOneTerm(id: number) {
    const term = await this.termRepository.findById(id);
    if (!term) throw new NotFoundException('Term not found');
    return term;
  }

  async updateTerm(id: number, dto: UpdateTermDto) {
    await this.findOneTerm(id);
    return this.termRepository.update(id, dto);
  }

  async removeTerm(id: number): Promise<void> {
    await this.findOneTerm(id);
    return this.termRepository.remove(id);
  }
}
