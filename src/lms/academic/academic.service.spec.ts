import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { AcademicYearRepository } from './infrastructure/persistence/academic-year.repository';
import { TermRepository } from './infrastructure/persistence/term.repository';

function createMockRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

describe('AcademicService', () => {
  let service: AcademicService;
  let academicYearRepo: ReturnType<typeof createMockRepository>;
  let termRepo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    academicYearRepo = createMockRepository();
    termRepo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicService,
        { provide: AcademicYearRepository, useValue: academicYearRepo },
        { provide: TermRepository, useValue: termRepo },
      ],
    }).compile();

    service = module.get<AcademicService>(AcademicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Academic Year ────────────────────────────────────
  describe('AcademicYear', () => {
    const mockYear = {
      id: 1,
      name: '2025-2026',
      startDate: '2025-04-01',
      endDate: '2026-03-31',
    };

    describe('createAcademicYear', () => {
      it('should create an academic year', async () => {
        academicYearRepo.create.mockResolvedValue(mockYear);
        const result = await service.createAcademicYear({
          name: '2025-2026',
        } as any);
        expect(result).toEqual(mockYear);
        expect(academicYearRepo.create).toHaveBeenCalled();
      });
    });

    describe('findAllAcademicYears', () => {
      it('should return all academic years', async () => {
        academicYearRepo.findAll.mockResolvedValue([mockYear]);
        expect(await service.findAllAcademicYears()).toEqual([mockYear]);
      });
    });

    describe('findOneAcademicYear', () => {
      it('should return an academic year by id', async () => {
        academicYearRepo.findById.mockResolvedValue(mockYear);
        expect(await service.findOneAcademicYear(1)).toEqual(mockYear);
      });

      it('should throw NotFoundException if not found', async () => {
        academicYearRepo.findById.mockResolvedValue(null);
        await expect(service.findOneAcademicYear(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateAcademicYear', () => {
      it('should update an academic year', async () => {
        academicYearRepo.findById.mockResolvedValue(mockYear);
        academicYearRepo.update.mockResolvedValue({
          ...mockYear,
          name: '2026-2027',
        });
        const result = await service.updateAcademicYear(1, {
          name: '2026-2027',
        } as any);
        expect(result?.name).toBe('2026-2027');
      });

      it('should throw NotFoundException if not found', async () => {
        academicYearRepo.findById.mockResolvedValue(null);
        await expect(
          service.updateAcademicYear(999, {} as any),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('removeAcademicYear', () => {
      it('should remove an academic year', async () => {
        academicYearRepo.findById.mockResolvedValue(mockYear);
        academicYearRepo.remove.mockResolvedValue(undefined);
        await expect(service.removeAcademicYear(1)).resolves.toBeUndefined();
      });

      it('should throw NotFoundException if not found', async () => {
        academicYearRepo.findById.mockResolvedValue(null);
        await expect(service.removeAcademicYear(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  // ─── Term ─────────────────────────────────────────────
  describe('Term', () => {
    const mockTerm = { id: 1, name: 'Term 1' };

    describe('createTerm', () => {
      it('should create a term after validating academic year', async () => {
        academicYearRepo.findById.mockResolvedValue({ id: 1 });
        termRepo.create.mockResolvedValue(mockTerm);
        const result = await service.createTerm({
          academicYearId: 1,
          name: 'Term 1',
        } as any);
        expect(result).toEqual(mockTerm);
      });

      it('should throw NotFoundException if academic year not found', async () => {
        academicYearRepo.findById.mockResolvedValue(null);
        await expect(
          service.createTerm({ academicYearId: 999 } as any),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('findAllTerms', () => {
      it('should return all terms', async () => {
        termRepo.findAll.mockResolvedValue([mockTerm]);
        expect(await service.findAllTerms()).toEqual([mockTerm]);
      });
    });

    describe('findOneTerm', () => {
      it('should return a term by id', async () => {
        termRepo.findById.mockResolvedValue(mockTerm);
        expect(await service.findOneTerm(1)).toEqual(mockTerm);
      });

      it('should throw NotFoundException if not found', async () => {
        termRepo.findById.mockResolvedValue(null);
        await expect(service.findOneTerm(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateTerm', () => {
      it('should update a term', async () => {
        termRepo.findById.mockResolvedValue(mockTerm);
        termRepo.update.mockResolvedValue({ ...mockTerm, name: 'Term 2' });
        const result = await service.updateTerm(1, { name: 'Term 2' } as any);
        expect(result?.name).toBe('Term 2');
      });

      it('should throw NotFoundException if not found', async () => {
        termRepo.findById.mockResolvedValue(null);
        await expect(service.updateTerm(999, {} as any)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('removeTerm', () => {
      it('should remove a term', async () => {
        termRepo.findById.mockResolvedValue(mockTerm);
        termRepo.remove.mockResolvedValue(undefined);
        await expect(service.removeTerm(1)).resolves.toBeUndefined();
      });

      it('should throw NotFoundException if not found', async () => {
        termRepo.findById.mockResolvedValue(null);
        await expect(service.removeTerm(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
