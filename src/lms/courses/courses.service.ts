import { Injectable, NotFoundException } from '@nestjs/common';
import { InstitutionRepository } from './infrastructure/persistence/institution.repository';
import { DepartmentRepository } from './infrastructure/persistence/department.repository';
import { GradeClassRepository } from './infrastructure/persistence/grade-class.repository';
import { SectionRepository } from './infrastructure/persistence/section.repository';
import { SubjectRepository } from './infrastructure/persistence/subject.repository';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreateGradeClassDto } from './dto/create-grade-class.dto';
import { UpdateGradeClassDto } from './dto/update-grade-class.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Institution } from './domain/institution';
import { NullableType } from '../../utils/types/nullable.type';

@Injectable()
export class CoursesService {
  constructor(
    private readonly institutionRepository: InstitutionRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly gradeClassRepository: GradeClassRepository,
    private readonly sectionRepository: SectionRepository,
    private readonly subjectRepository: SubjectRepository,
  ) {}

  // ─── Institution ──────────────────────────────────────
  createInstitution(dto: CreateInstitutionDto): Promise<Institution> {
    return this.institutionRepository.create(dto);
  }

  findAllInstitutions() {
    return this.institutionRepository.findAll();
  }

  async findOneInstitution(id: number) {
    const institution = await this.institutionRepository.findById(id);
    if (!institution) throw new NotFoundException('Institution not found');
    return institution;
  }

  async updateInstitution(
    id: number,
    dto: UpdateInstitutionDto,
  ): Promise<NullableType<Institution>> {
    await this.findOneInstitution(id);
    return this.institutionRepository.update(id, dto);
  }

  async removeInstitution(id: number): Promise<void> {
    await this.findOneInstitution(id);
    return this.institutionRepository.remove(id);
  }

  // ─── Department ───────────────────────────────────────
  async createDepartment(dto: CreateDepartmentDto) {
    await this.findOneInstitution(dto.institutionId);
    return this.departmentRepository.create(dto);
  }

  findAllDepartments() {
    return this.departmentRepository.findAll();
  }

  async findOneDepartment(id: number) {
    const department = await this.departmentRepository.findById(id);
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  async updateDepartment(id: number, dto: UpdateDepartmentDto) {
    await this.findOneDepartment(id);
    return this.departmentRepository.update(id, dto);
  }

  async removeDepartment(id: number): Promise<void> {
    await this.findOneDepartment(id);
    return this.departmentRepository.remove(id);
  }

  // ─── Grade Class ──────────────────────────────────────
  async createGradeClass(dto: CreateGradeClassDto) {
    await this.findOneInstitution(dto.institutionId);
    return this.gradeClassRepository.create(dto);
  }

  findAllGradeClasses() {
    return this.gradeClassRepository.findAll();
  }

  async findOneGradeClass(id: number) {
    const gradeClass = await this.gradeClassRepository.findById(id);
    if (!gradeClass) throw new NotFoundException('Grade class not found');
    return gradeClass;
  }

  async updateGradeClass(id: number, dto: UpdateGradeClassDto) {
    await this.findOneGradeClass(id);
    return this.gradeClassRepository.update(id, dto);
  }

  async removeGradeClass(id: number): Promise<void> {
    await this.findOneGradeClass(id);
    return this.gradeClassRepository.remove(id);
  }

  // ─── Section ──────────────────────────────────────────
  async createSection(dto: CreateSectionDto) {
    await this.findOneGradeClass(dto.gradeClassId);
    return this.sectionRepository.create(dto);
  }

  findAllSections() {
    return this.sectionRepository.findAll();
  }

  async findOneSection(id: number) {
    const section = await this.sectionRepository.findById(id);
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async updateSection(id: number, dto: UpdateSectionDto) {
    await this.findOneSection(id);
    return this.sectionRepository.update(id, dto);
  }

  async removeSection(id: number): Promise<void> {
    await this.findOneSection(id);
    return this.sectionRepository.remove(id);
  }

  // ─── Subject ──────────────────────────────────────────
  async createSubject(dto: CreateSubjectDto) {
    await this.findOneDepartment(dto.departmentId);
    return this.subjectRepository.create(dto);
  }

  findAllSubjects() {
    return this.subjectRepository.findAll();
  }

  async findOneSubject(id: number) {
    const subject = await this.subjectRepository.findById(id);
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async updateSubject(id: number, dto: UpdateSubjectDto) {
    await this.findOneSubject(id);
    return this.subjectRepository.update(id, dto);
  }

  async removeSubject(id: number): Promise<void> {
    await this.findOneSubject(id);
    return this.subjectRepository.remove(id);
  }
}
