import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { StudentRegistrationService } from '../student-registration.service';
import { StudentRepository } from '../../lms/student/infrastructure/persistence/student.repository';
import { StudentEnrollmentRepository } from '../../lms/student/infrastructure/persistence/student-enrollment.repository';
import { StudentDocumentRepository } from '../../lms/student/infrastructure/persistence/student-document.repository';
import { UsersService } from '../../users/users.service';
import { InstitutionRepository } from '../../lms/courses/infrastructure/persistence/institution.repository';
import { StudentIdGeneratorService } from '../student-id-generator.service';
import { StudentImportService } from '../student-import.service';
import { StudentGuardianRepository } from '../infrastructure/persistence/student-guardian.repository';

function createMockRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

function createMockUsersService() {
  return {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

describe('StudentRegistrationService - Guardian Management', () => {
  let service: StudentRegistrationService;
  let studentRepo: ReturnType<typeof createMockRepository>;
  let enrollmentRepo: ReturnType<typeof createMockRepository>;
  let documentRepo: ReturnType<typeof createMockRepository>;
  let institutionRepo: ReturnType<typeof createMockRepository>;
  let guardianRepo: ReturnType<typeof createMockRepository>;
  let usersService: ReturnType<typeof createMockUsersService>;
  let idGenerator: { generate: jest.Mock };
  let importService: { parseAndValidateCsv: jest.Mock };

  beforeEach(async () => {
    studentRepo = createMockRepository();
    enrollmentRepo = createMockRepository();
    documentRepo = createMockRepository();
    institutionRepo = createMockRepository();
    guardianRepo = createMockRepository();
    usersService = createMockUsersService();
    idGenerator = { generate: jest.fn() };
    importService = { parseAndValidateCsv: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentRegistrationService,
        { provide: StudentRepository, useValue: studentRepo },
        { provide: StudentEnrollmentRepository, useValue: enrollmentRepo },
        { provide: StudentDocumentRepository, useValue: documentRepo },
        { provide: InstitutionRepository, useValue: institutionRepo },
        { provide: StudentGuardianRepository, useValue: guardianRepo },
        { provide: UsersService, useValue: usersService },
        { provide: StudentIdGeneratorService, useValue: idGenerator },
        { provide: StudentImportService, useValue: importService },
      ],
    }).compile();

    service = module.get<StudentRegistrationService>(
      StudentRegistrationService,
    );
  });

  // ─── addGuardian ──────────────────────────────────────
  describe('addGuardian', () => {
    it('should create a guardian record for a student', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });
      guardianRepo.create.mockResolvedValue({
        id: 1,
        studentId: 1,
        name: 'Jane Doe',
        phone: '+1555000001',
        email: 'jane@example.com',
        relation: 'Mother',
        isPrimary: true,
      });

      const result = await service.addGuardian(1, {
        name: 'Jane Doe',
        phone: '+1555000001',
        email: 'jane@example.com',
        relation: 'Mother',
        isPrimary: true,
      });

      expect(result.name).toBe('Jane Doe');
      expect(result.isPrimary).toBe(true);
      expect(guardianRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: 1,
          name: 'Jane Doe',
          isPrimary: true,
        }),
      );
    });

    it('should support multiple guardians for a student', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });
      guardianRepo.findAll.mockResolvedValue([
        { id: 1, studentId: 1, name: 'Jane Doe', isPrimary: true },
      ]);
      guardianRepo.create.mockResolvedValue({
        id: 2,
        studentId: 1,
        name: 'John Doe Sr',
        phone: '+1555000002',
        relation: 'Father',
        isPrimary: false,
      });

      const result = await service.addGuardian(1, {
        name: 'John Doe Sr',
        phone: '+1555000002',
        relation: 'Father',
        isPrimary: false,
      });

      expect(result.id).toBe(2);
      expect(result.name).toBe('John Doe Sr');
    });

    it('should throw NotFoundException for non-existent student', async () => {
      studentRepo.findById.mockResolvedValue(null);

      await expect(
        service.addGuardian(999, {
          name: 'Nobody',
          phone: '+1555000099',
          relation: 'Parent',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnprocessableEntityException when name is missing', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });

      await expect(
        service.addGuardian(1, {
          name: '',
          phone: '+1555000001',
          relation: 'Parent',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException when phone is missing', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });

      await expect(
        service.addGuardian(1, {
          name: 'Jane Doe',
          phone: '',
          relation: 'Parent',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  // ─── findGuardians ────────────────────────────────────
  describe('findGuardians', () => {
    it('should return all guardians for a student', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });
      guardianRepo.findAll.mockResolvedValue([
        { id: 1, studentId: 1, name: 'Jane Doe', isPrimary: true },
        { id: 2, studentId: 1, name: 'John Doe Sr', isPrimary: false },
        { id: 3, studentId: 2, name: 'Other Parent', isPrimary: true },
      ]);

      const result = await service.findGuardians(1);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Jane Doe');
      expect(result[1].name).toBe('John Doe Sr');
    });

    it('should return empty array when no guardians exist', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });
      guardianRepo.findAll.mockResolvedValue([]);

      const result = await service.findGuardians(1);

      expect(result).toHaveLength(0);
    });

    it('should throw NotFoundException for non-existent student', async () => {
      studentRepo.findById.mockResolvedValue(null);

      await expect(service.findGuardians(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── findDocuments ────────────────────────────────────
  describe('findDocuments', () => {
    it('should return all documents for a student', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });
      documentRepo.findAll.mockResolvedValue([
        { id: 1, studentId: 1, documentType: 'Birth Certificate' },
        { id: 2, studentId: 1, documentType: 'ID Card' },
        { id: 3, studentId: 2, documentType: 'Transcript' },
      ]);

      const result = await service.findDocuments(1);

      expect(result).toHaveLength(2);
      expect(result[0].documentType).toBe('Birth Certificate');
    });

    it('should filter documents by documentType', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });
      documentRepo.findAll.mockResolvedValue([
        { id: 1, studentId: 1, documentType: 'Birth Certificate' },
        { id: 2, studentId: 1, documentType: 'ID Card' },
      ]);

      const result = await service.findDocuments(1, 'ID Card');

      expect(result).toHaveLength(1);
      expect(result[0].documentType).toBe('ID Card');
    });

    it('should return empty array when no documents exist', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });
      documentRepo.findAll.mockResolvedValue([]);

      const result = await service.findDocuments(1);

      expect(result).toHaveLength(0);
    });

    it('should throw NotFoundException for non-existent student', async () => {
      studentRepo.findById.mockResolvedValue(null);

      await expect(service.findDocuments(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
