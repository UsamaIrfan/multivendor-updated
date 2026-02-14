import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { InstitutionRepository } from './infrastructure/persistence/institution.repository';
import { DepartmentRepository } from './infrastructure/persistence/department.repository';
import { GradeClassRepository } from './infrastructure/persistence/grade-class.repository';
import { SectionRepository } from './infrastructure/persistence/section.repository';
import { SubjectRepository } from './infrastructure/persistence/subject.repository';

function createMockRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

describe('CoursesService', () => {
  let service: CoursesService;
  let institutionRepo: ReturnType<typeof createMockRepository>;
  let departmentRepo: ReturnType<typeof createMockRepository>;
  let gradeClassRepo: ReturnType<typeof createMockRepository>;
  let sectionRepo: ReturnType<typeof createMockRepository>;
  let subjectRepo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    institutionRepo = createMockRepository();
    departmentRepo = createMockRepository();
    gradeClassRepo = createMockRepository();
    sectionRepo = createMockRepository();
    subjectRepo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: InstitutionRepository, useValue: institutionRepo },
        { provide: DepartmentRepository, useValue: departmentRepo },
        { provide: GradeClassRepository, useValue: gradeClassRepo },
        { provide: SectionRepository, useValue: sectionRepo },
        { provide: SubjectRepository, useValue: subjectRepo },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Institution ──────────────────────────────────────
  describe('Institution', () => {
    const mockInstitution = { id: 1, name: 'Test School' };

    describe('createInstitution', () => {
      it('should create an institution', async () => {
        institutionRepo.create.mockResolvedValue(mockInstitution);
        const result = await service.createInstitution({
          name: 'Test School',
          type: 'school',
        } as any);
        expect(result).toEqual(mockInstitution);
        expect(institutionRepo.create).toHaveBeenCalled();
      });
    });

    describe('findAllInstitutions', () => {
      it('should return all institutions', async () => {
        institutionRepo.findAll.mockResolvedValue([mockInstitution]);
        const result = await service.findAllInstitutions();
        expect(result).toEqual([mockInstitution]);
      });
    });

    describe('findOneInstitution', () => {
      it('should return an institution by id', async () => {
        institutionRepo.findById.mockResolvedValue(mockInstitution);
        const result = await service.findOneInstitution(1);
        expect(result).toEqual(mockInstitution);
      });

      it('should throw NotFoundException if not found', async () => {
        institutionRepo.findById.mockResolvedValue(null);
        await expect(service.findOneInstitution(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateInstitution', () => {
      it('should update an institution', async () => {
        institutionRepo.findById.mockResolvedValue(mockInstitution);
        institutionRepo.update.mockResolvedValue({
          ...mockInstitution,
          name: 'Updated',
        });
        const result = await service.updateInstitution(1, {
          name: 'Updated',
        } as any);
        expect(result?.name).toBe('Updated');
      });

      it('should throw NotFoundException if not found', async () => {
        institutionRepo.findById.mockResolvedValue(null);
        await expect(
          service.updateInstitution(999, { name: 'X' } as any),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('removeInstitution', () => {
      it('should remove an institution', async () => {
        institutionRepo.findById.mockResolvedValue(mockInstitution);
        institutionRepo.remove.mockResolvedValue(undefined);
        await expect(service.removeInstitution(1)).resolves.toBeUndefined();
      });

      it('should throw NotFoundException if not found', async () => {
        institutionRepo.findById.mockResolvedValue(null);
        await expect(service.removeInstitution(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  // ─── Department ───────────────────────────────────────
  describe('Department', () => {
    const mockDepartment = { id: 1, name: 'Science' };

    describe('createDepartment', () => {
      it('should create a department after validating institution', async () => {
        institutionRepo.findById.mockResolvedValue({ id: 1 });
        departmentRepo.create.mockResolvedValue(mockDepartment);
        const result = await service.createDepartment({
          institutionId: 1,
          name: 'Science',
        } as any);
        expect(result).toEqual(mockDepartment);
      });

      it('should throw NotFoundException if institution not found', async () => {
        institutionRepo.findById.mockResolvedValue(null);
        await expect(
          service.createDepartment({ institutionId: 999, name: 'X' } as any),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('findAllDepartments', () => {
      it('should return all departments', async () => {
        departmentRepo.findAll.mockResolvedValue([mockDepartment]);
        const result = await service.findAllDepartments();
        expect(result).toEqual([mockDepartment]);
      });
    });

    describe('findOneDepartment', () => {
      it('should return a department by id', async () => {
        departmentRepo.findById.mockResolvedValue(mockDepartment);
        const result = await service.findOneDepartment(1);
        expect(result).toEqual(mockDepartment);
      });

      it('should throw NotFoundException if not found', async () => {
        departmentRepo.findById.mockResolvedValue(null);
        await expect(service.findOneDepartment(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateDepartment', () => {
      it('should update a department', async () => {
        departmentRepo.findById.mockResolvedValue(mockDepartment);
        departmentRepo.update.mockResolvedValue({
          ...mockDepartment,
          name: 'Math',
        });
        const result = await service.updateDepartment(1, {
          name: 'Math',
        } as any);
        expect(result?.name).toBe('Math');
      });

      it('should throw NotFoundException if not found', async () => {
        departmentRepo.findById.mockResolvedValue(null);
        await expect(service.updateDepartment(999, {} as any)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('removeDepartment', () => {
      it('should remove a department', async () => {
        departmentRepo.findById.mockResolvedValue(mockDepartment);
        departmentRepo.remove.mockResolvedValue(undefined);
        await expect(service.removeDepartment(1)).resolves.toBeUndefined();
      });

      it('should throw NotFoundException if not found', async () => {
        departmentRepo.findById.mockResolvedValue(null);
        await expect(service.removeDepartment(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  // ─── Grade Class ──────────────────────────────────────
  describe('GradeClass', () => {
    const mockGradeClass = { id: 1, name: 'Grade 1' };

    describe('createGradeClass', () => {
      it('should create a grade class after validating institution', async () => {
        institutionRepo.findById.mockResolvedValue({ id: 1 });
        gradeClassRepo.create.mockResolvedValue(mockGradeClass);
        const result = await service.createGradeClass({
          institutionId: 1,
          name: 'Grade 1',
        } as any);
        expect(result).toEqual(mockGradeClass);
      });

      it('should throw NotFoundException if institution not found', async () => {
        institutionRepo.findById.mockResolvedValue(null);
        await expect(
          service.createGradeClass({ institutionId: 999 } as any),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('findAllGradeClasses', () => {
      it('should return all grade classes', async () => {
        gradeClassRepo.findAll.mockResolvedValue([mockGradeClass]);
        expect(await service.findAllGradeClasses()).toEqual([mockGradeClass]);
      });
    });

    describe('findOneGradeClass', () => {
      it('should return a grade class by id', async () => {
        gradeClassRepo.findById.mockResolvedValue(mockGradeClass);
        expect(await service.findOneGradeClass(1)).toEqual(mockGradeClass);
      });

      it('should throw NotFoundException if not found', async () => {
        gradeClassRepo.findById.mockResolvedValue(null);
        await expect(service.findOneGradeClass(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateGradeClass', () => {
      it('should update a grade class', async () => {
        gradeClassRepo.findById.mockResolvedValue(mockGradeClass);
        gradeClassRepo.update.mockResolvedValue({
          ...mockGradeClass,
          name: 'Grade 2',
        });
        const result = await service.updateGradeClass(1, {
          name: 'Grade 2',
        } as any);
        expect(result?.name).toBe('Grade 2');
      });

      it('should throw NotFoundException if not found', async () => {
        gradeClassRepo.findById.mockResolvedValue(null);
        await expect(service.updateGradeClass(999, {} as any)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('removeGradeClass', () => {
      it('should remove a grade class', async () => {
        gradeClassRepo.findById.mockResolvedValue(mockGradeClass);
        gradeClassRepo.remove.mockResolvedValue(undefined);
        await expect(service.removeGradeClass(1)).resolves.toBeUndefined();
      });

      it('should throw NotFoundException if not found', async () => {
        gradeClassRepo.findById.mockResolvedValue(null);
        await expect(service.removeGradeClass(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  // ─── Section ──────────────────────────────────────────
  describe('Section', () => {
    const mockSection = { id: 1, name: 'A' };

    describe('createSection', () => {
      it('should create a section after validating grade class', async () => {
        gradeClassRepo.findById.mockResolvedValue({ id: 1 });
        sectionRepo.create.mockResolvedValue(mockSection);
        const result = await service.createSection({
          gradeClassId: 1,
          name: 'A',
        } as any);
        expect(result).toEqual(mockSection);
      });

      it('should throw NotFoundException if grade class not found', async () => {
        gradeClassRepo.findById.mockResolvedValue(null);
        await expect(
          service.createSection({ gradeClassId: 999 } as any),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('findAllSections', () => {
      it('should return all sections', async () => {
        sectionRepo.findAll.mockResolvedValue([mockSection]);
        expect(await service.findAllSections()).toEqual([mockSection]);
      });
    });

    describe('findOneSection', () => {
      it('should return a section by id', async () => {
        sectionRepo.findById.mockResolvedValue(mockSection);
        expect(await service.findOneSection(1)).toEqual(mockSection);
      });

      it('should throw NotFoundException if not found', async () => {
        sectionRepo.findById.mockResolvedValue(null);
        await expect(service.findOneSection(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateSection', () => {
      it('should update a section', async () => {
        sectionRepo.findById.mockResolvedValue(mockSection);
        sectionRepo.update.mockResolvedValue({ ...mockSection, name: 'B' });
        const result = await service.updateSection(1, { name: 'B' } as any);
        expect(result?.name).toBe('B');
      });

      it('should throw NotFoundException if not found', async () => {
        sectionRepo.findById.mockResolvedValue(null);
        await expect(service.updateSection(999, {} as any)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('removeSection', () => {
      it('should remove a section', async () => {
        sectionRepo.findById.mockResolvedValue(mockSection);
        sectionRepo.remove.mockResolvedValue(undefined);
        await expect(service.removeSection(1)).resolves.toBeUndefined();
      });

      it('should throw NotFoundException if not found', async () => {
        sectionRepo.findById.mockResolvedValue(null);
        await expect(service.removeSection(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  // ─── Subject ──────────────────────────────────────────
  describe('Subject', () => {
    const mockSubject = { id: 1, name: 'Math' };

    describe('createSubject', () => {
      it('should create a subject after validating department', async () => {
        departmentRepo.findById.mockResolvedValue({ id: 1 });
        subjectRepo.create.mockResolvedValue(mockSubject);
        const result = await service.createSubject({
          departmentId: 1,
          name: 'Math',
        } as any);
        expect(result).toEqual(mockSubject);
      });

      it('should throw NotFoundException if department not found', async () => {
        departmentRepo.findById.mockResolvedValue(null);
        await expect(
          service.createSubject({ departmentId: 999 } as any),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('findAllSubjects', () => {
      it('should return all subjects', async () => {
        subjectRepo.findAll.mockResolvedValue([mockSubject]);
        expect(await service.findAllSubjects()).toEqual([mockSubject]);
      });
    });

    describe('findOneSubject', () => {
      it('should return a subject by id', async () => {
        subjectRepo.findById.mockResolvedValue(mockSubject);
        expect(await service.findOneSubject(1)).toEqual(mockSubject);
      });

      it('should throw NotFoundException if not found', async () => {
        subjectRepo.findById.mockResolvedValue(null);
        await expect(service.findOneSubject(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateSubject', () => {
      it('should update a subject', async () => {
        subjectRepo.findById.mockResolvedValue(mockSubject);
        subjectRepo.update.mockResolvedValue({
          ...mockSubject,
          name: 'English',
        });
        const result = await service.updateSubject(1, {
          name: 'English',
        } as any);
        expect(result?.name).toBe('English');
      });

      it('should throw NotFoundException if not found', async () => {
        subjectRepo.findById.mockResolvedValue(null);
        await expect(service.updateSubject(999, {} as any)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('removeSubject', () => {
      it('should remove a subject', async () => {
        subjectRepo.findById.mockResolvedValue(mockSubject);
        subjectRepo.remove.mockResolvedValue(undefined);
        await expect(service.removeSubject(1)).resolves.toBeUndefined();
      });

      it('should throw NotFoundException if not found', async () => {
        subjectRepo.findById.mockResolvedValue(null);
        await expect(service.removeSubject(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
