import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
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
import { TenantContextService } from '../../tenant/tenant-context/tenant-context.service';
import { TenantService } from '../../tenant/tenant.service';
import { RoleEnum } from '../../roles/roles.enum';
import { GenderEnum } from '../../lms/common/enums/general.enum';

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

function createMockTenantContext() {
  return {
    hasContext: jest.fn().mockReturnValue(true),
    getTenantId: jest
      .fn()
      .mockReturnValue('00000000-0000-0000-0000-000000000001'),
    getBranchId: jest
      .fn()
      .mockReturnValue('00000000-0000-0000-0000-000000000001'),
  };
}

function createMockTenantService() {
  return {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

describe('StudentRegistrationService', () => {
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
        {
          provide: StudentEnrollmentRepository,
          useValue: enrollmentRepo,
        },
        {
          provide: StudentDocumentRepository,
          useValue: documentRepo,
        },
        { provide: InstitutionRepository, useValue: institutionRepo },
        { provide: StudentGuardianRepository, useValue: guardianRepo },
        { provide: UsersService, useValue: usersService },
        { provide: StudentIdGeneratorService, useValue: idGenerator },
        { provide: StudentImportService, useValue: importService },
        {
          provide: TenantContextService,
          useValue: createMockTenantContext(),
        },
        { provide: TenantService, useValue: createMockTenantService() },
      ],
    }).compile();

    service = module.get<StudentRegistrationService>(
      StudentRegistrationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create (register) ────────────────────────────────
  describe('register', () => {
    const validDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      password: 'Secret123!',
      institutionId: 1,
      dateOfBirth: '2012-05-15',
      gender: GenderEnum.male,
      guardianName: 'Jane Doe',
      guardianPhone: '+1555000001',
    };

    it('should generate unique student_id', async () => {
      institutionRepo.findById.mockResolvedValue({ id: 1, name: 'Test' });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: 10,
        email: validDto.email,
        role: { id: RoleEnum.student },
      });
      idGenerator.generate.mockResolvedValue('STU-2026-0001');
      studentRepo.create.mockResolvedValue({
        id: 1,
        userId: 10,
        rollNumber: 'STU-2026-0001',
        studentId: 'STU-2026-0001',
        ...validDto,
      });

      const result = await service.register(validDto);

      expect(idGenerator.generate).toHaveBeenCalled();
      expect(result.studentId).toMatch(/^STU-\d{4}-\d{4,}$/);
    });

    it('should create associated user account with student role', async () => {
      institutionRepo.findById.mockResolvedValue({ id: 1, name: 'Test' });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: 10,
        email: validDto.email,
        role: { id: RoleEnum.student },
      });
      idGenerator.generate.mockResolvedValue('STU-2026-0001');
      studentRepo.create.mockResolvedValue({
        id: 1,
        userId: 10,
        rollNumber: 'STU-2026-0001',
        studentId: 'STU-2026-0001',
        ...validDto,
      });

      await service.register(validDto);

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: validDto.email,
          password: validDto.password,
          firstName: validDto.firstName,
          lastName: validDto.lastName,
          role: { id: RoleEnum.student },
        }),
      );
    });

    it('should throw ConflictException for duplicate email', async () => {
      institutionRepo.findById.mockResolvedValue({ id: 1, name: 'Test' });
      usersService.findByEmail.mockResolvedValue({
        id: 5,
        email: validDto.email,
      });

      await expect(service.register(validDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException for invalid institutionId', async () => {
      institutionRepo.findById.mockResolvedValue(null);

      await expect(service.register(validDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnprocessableEntityException for age < 5', async () => {
      const recentDate = new Date();
      recentDate.setFullYear(recentDate.getFullYear() - 3);
      const youngDto = {
        ...validDto,
        dateOfBirth: recentDate.toISOString().split('T')[0],
      };

      institutionRepo.findById.mockResolvedValue({ id: 1, name: 'Test' });
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.register(youngDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw UnprocessableEntityException when guardian info missing', async () => {
      const noGuardianDto = {
        ...validDto,
        guardianName: undefined,
        guardianPhone: undefined,
      };

      institutionRepo.findById.mockResolvedValue({ id: 1, name: 'Test' });
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.register(noGuardianDto as any)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  // ─── findAll (paginated) ──────────────────────────────
  describe('findAll', () => {
    it('should return paginated results', async () => {
      studentRepo.findAll.mockResolvedValue([
        { id: 1, rollNumber: 'STU-2026-0001' },
        { id: 2, rollNumber: 'STU-2026-0002' },
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter by search term', async () => {
      studentRepo.findAll.mockResolvedValue([
        { id: 1, rollNumber: 'STU-2026-0001' },
      ]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        search: 'John',
      });

      expect(result.data).toBeDefined();
    });
  });

  // ─── findOne ──────────────────────────────────────────
  describe('findOne', () => {
    it('should return student with relations', async () => {
      studentRepo.findById.mockResolvedValue({
        id: 1,
        rollNumber: 'STU-2026-0001',
        guardianName: 'Jane Doe',
      });
      enrollmentRepo.findAll.mockResolvedValue([]);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.guardianName).toBe('Jane Doe');
    });

    it('should throw NotFoundException for non-existent student', async () => {
      studentRepo.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ───────────────────────────────────────────
  describe('update', () => {
    it('should update student profile', async () => {
      studentRepo.findById.mockResolvedValue({
        id: 1,
        city: 'Old City',
      });
      studentRepo.update.mockResolvedValue({
        id: 1,
        city: 'New City',
      });

      const result = await service.update(1, { city: 'New City' });

      expect(result!.city).toBe('New City');
    });

    it('should throw NotFoundException if student not found', async () => {
      studentRepo.findById.mockResolvedValue(null);

      await expect(service.update(999, { city: 'Nowhere' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── enrollInClass ────────────────────────────────────
  describe('enrollInClass', () => {
    it('should create enrollment record', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });
      enrollmentRepo.findAll.mockResolvedValue([]);
      enrollmentRepo.create.mockResolvedValue({
        id: 1,
        studentId: 1,
        sectionId: 1,
        academicYearId: 1,
        status: 'active',
      });

      const result = await service.enrollInClass(1, {
        sectionId: 1,
        academicYearId: 1,
      });

      expect(result.status).toBe('active');
      expect(enrollmentRepo.create).toHaveBeenCalled();
    });

    it('should prevent duplicate enrollment', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });
      enrollmentRepo.findAll.mockResolvedValue([
        { id: 1, studentId: 1, sectionId: 1, academicYearId: 1 },
      ]);

      await expect(
        service.enrollInClass(1, { sectionId: 1, academicYearId: 1 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if student not found', async () => {
      studentRepo.findById.mockResolvedValue(null);

      await expect(
        service.enrollInClass(999, { sectionId: 1, academicYearId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── uploadDocument ───────────────────────────────────
  describe('uploadDocument', () => {
    it('should save document metadata', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });
      documentRepo.create.mockResolvedValue({
        id: 1,
        studentId: 1,
        documentType: 'Birth Certificate',
        isVerified: false,
      });

      const result = await service.uploadDocument(1, {
        documentType: 'Birth Certificate',
        remarks: 'Original copy',
      });

      expect(result.documentType).toBe('Birth Certificate');
      expect(documentRepo.create).toHaveBeenCalled();
    });

    it('should link document to student', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });
      documentRepo.create.mockResolvedValue({
        id: 1,
        studentId: 1,
        documentType: 'ID Proof',
      });

      const result = await service.uploadDocument(1, {
        documentType: 'ID Proof',
      });

      expect(result.studentId).toBe(1);
    });

    it('should throw NotFoundException if student not found', async () => {
      studentRepo.findById.mockResolvedValue(null);

      await expect(
        service.uploadDocument(999, {
          documentType: 'Birth Certificate',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── importStudents ───────────────────────────────────
  describe('importStudents', () => {
    it('should parse CSV and return import results', async () => {
      importService.parseAndValidateCsv.mockReturnValue({
        validRows: [
          {
            firstName: 'A',
            lastName: 'B',
            email: 'a@b.com',
            password: 'Pass123!',
            dateOfBirth: '2012-01-01',
            gender: 'male',
            guardianName: 'P',
            guardianPhone: '+1555',
          },
        ],
        errors: [],
      });
      institutionRepo.findById.mockResolvedValue({ id: 1 });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: 10,
        role: { id: RoleEnum.student },
      });
      idGenerator.generate.mockResolvedValue('STU-2026-0001');
      studentRepo.create.mockResolvedValue({
        id: 1,
        studentId: 'STU-2026-0001',
      });

      const result = await service.importStudents(
        Buffer.from('csv content'),
        1,
        'students.csv',
      );

      expect(result.imported).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should return detailed error report for bad rows', async () => {
      importService.parseAndValidateCsv.mockReturnValue({
        validRows: [],
        errors: [{ row: 1, message: 'firstName is required' }],
      });

      const result = await service.importStudents(
        Buffer.from('csv content'),
        1,
        'students.csv',
      );

      expect(result.imported).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toHaveProperty('row');
      expect(result.errors[0]).toHaveProperty('message');
    });
  });

  // ─── remove ───────────────────────────────────────────
  describe('remove', () => {
    it('should soft-delete student', async () => {
      studentRepo.findById.mockResolvedValue({ id: 1 });
      studentRepo.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(studentRepo.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if student not found', async () => {
      studentRepo.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
