import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StudentRepository } from '../lms/student/infrastructure/persistence/student.repository';
import { StudentEnrollmentRepository } from '../lms/student/infrastructure/persistence/student-enrollment.repository';
import { StudentDocumentRepository } from '../lms/student/infrastructure/persistence/student-document.repository';
import { InstitutionRepository } from '../lms/courses/infrastructure/persistence/institution.repository';
import { UsersService } from '../users/users.service';
import { StudentIdGeneratorService } from './student-id-generator.service';
import { StudentImportService } from './student-import.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { UpdateRegisteredStudentDto } from './dto/update-registered-student.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { UploadStudentDocumentDto } from './dto/upload-student-document.dto';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { StudentGuardianRepository } from './infrastructure/persistence/student-guardian.repository';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import {
  validateStudentAge,
  validateGuardianInfo,
} from './validators/student-validator';
import { EnrollmentStatusEnum } from '../lms/common/enums/general.enum';

@Injectable()
export class StudentRegistrationService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly enrollmentRepository: StudentEnrollmentRepository,
    private readonly documentRepository: StudentDocumentRepository,
    private readonly institutionRepository: InstitutionRepository,
    private readonly guardianRepository: StudentGuardianRepository,
    private readonly usersService: UsersService,
    private readonly idGenerator: StudentIdGeneratorService,
    private readonly importService: StudentImportService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Register a new student: create user account + student record.
   * Wrapped in a transaction so a failure in student creation
   * rolls back the user creation (no orphaned users).
   */
  async register(dto: RegisterStudentDto, idOffset = 0) {
    // 1. Validate institution exists
    const institution = await this.institutionRepository.findById(
      dto.institutionId,
    );
    if (!institution) {
      throw new NotFoundException('Institution not found');
    }

    // 2. Validate age >= 5
    if (dto.dateOfBirth) {
      validateStudentAge(dto.dateOfBirth);
    }

    // 3. Validate guardian info
    validateGuardianInfo({
      guardianName: dto.guardianName,
      guardianPhone: dto.guardianPhone,
    });

    // 4. Check duplicate email
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException({
        status: 409,
        errors: {
          email: 'A user with this email already exists',
        },
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 5. Create user account with student role
      const user = await this.usersService.create({
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: { id: RoleEnum.student },
        status: { id: StatusEnum.active },
      });

      // 6. Generate student ID
      const studentId = await this.idGenerator.generate(idOffset);

      // 7. Create student record
      const student = await this.studentRepository.create({
        userId: user.id as number,
        institutionId: dto.institutionId,
        rollNumber: studentId,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        gender: dto.gender ?? null,
        guardianName: dto.guardianName ?? null,
        guardianPhone: dto.guardianPhone ?? null,
        guardianEmail: dto.guardianEmail ?? null,
        guardianRelation: dto.guardianRelation ?? null,
        address: dto.address ?? null,
        city: dto.city ?? null,
        bloodGroup: dto.bloodGroup ?? null,
        nationality: dto.nationality ?? null,
        religion: dto.religion ?? null,
        admissionDate: dto.admissionDate
          ? new Date(dto.admissionDate)
          : new Date(),
      } as any);

      await queryRunner.commitTransaction();

      return {
        ...student,
        studentId,
        userId: user.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get paginated, filterable list of students.
   */
  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    institutionId?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    let allStudents = await this.studentRepository.findAll();

    // Apply filters
    if (query.institutionId) {
      allStudents = allStudents.filter(
        (s: any) => s.institutionId === query.institutionId,
      );
    }

    if (query.search) {
      const term = query.search.toLowerCase();
      allStudents = allStudents.filter((s: any) => {
        const searchable =
          `${s.firstName || ''} ${s.lastName || ''} ${s.email || ''} ${s.guardianName || ''} ${s.rollNumber || ''}`.toLowerCase();
        return searchable.includes(term);
      });
    }

    // Simple pagination
    const start = (page - 1) * limit;
    const data = allStudents.slice(start, start + limit);
    const hasNextPage = start + limit < allStudents.length;

    return { data, hasNextPage };
  }

  /**
   * Get a single student by ID with relations.
   */
  async findOne(id: number) {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Augment with enrollments
    const allEnrollments = await this.enrollmentRepository.findAll();
    const enrollments = allEnrollments.filter((e: any) => e.studentId === id);

    return {
      ...student,
      studentId: (student as any).rollNumber,
      enrollments,
    };
  }

  /**
   * Update a student's profile information.
   */
  async update(id: number, dto: UpdateRegisteredStudentDto) {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const updated = await this.studentRepository.update(id, dto as any);
    return updated;
  }

  /**
   * Remove (soft-delete) a student.
   */
  async remove(id: number) {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    await this.studentRepository.remove(id);
  }

  /**
   * Enroll a student in a class (section + academic year).
   */
  async enrollInClass(studentId: number, dto: EnrollStudentDto) {
    // Validate student exists
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check for duplicate enrollment
    const allEnrollments = await this.enrollmentRepository.findAll();
    const duplicate = allEnrollments.find(
      (e: any) =>
        e.studentId === studentId &&
        e.sectionId === dto.sectionId &&
        e.academicYearId === dto.academicYearId,
    );
    if (duplicate) {
      throw new ConflictException({
        status: 409,
        errors: {
          enrollment:
            'Student is already enrolled in this section for this academic year',
        },
      });
    }

    // Create enrollment
    const enrollment = await this.enrollmentRepository.create({
      studentId,
      sectionId: dto.sectionId,
      academicYearId: dto.academicYearId,
      status: EnrollmentStatusEnum.active,
      enrollmentDate: new Date(),
    } as any);

    return enrollment;
  }

  /**
   * Upload a document for a student.
   */
  async uploadDocument(studentId: number, dto: UploadStudentDocumentDto) {
    // Validate student exists
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Validate document type is present
    if (!dto.documentType || dto.documentType.trim() === '') {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          documentType: 'Document type is required',
        },
      });
    }

    const doc = await this.documentRepository.create({
      studentId,
      documentType: dto.documentType,
      fileId: dto.fileId ?? null,
      isVerified: false,
      remarks: dto.remarks ?? null,
    } as any);

    return doc;
  }

  /**
   * Add a guardian for a student (supports multiple guardians).
   */
  async addGuardian(studentId: number, dto: CreateGuardianDto) {
    // Validate student exists
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Validate guardian contact info
    if (!dto.name || dto.name.trim() === '') {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { name: 'Guardian name is required' },
      });
    }
    if (!dto.phone || dto.phone.trim() === '') {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { phone: 'Guardian phone is required' },
      });
    }

    // Auto-create a parent user account if requested
    let parentUserId: number | null = null;
    if (dto.createUserAccount && dto.email) {
      if (!dto.password) {
        throw new UnprocessableEntityException({
          status: 422,
          errors: {
            password: 'Password is required when creating a parent user account',
          },
        });
      }

      // Split guardian name into first/last
      const nameParts = dto.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const parentUser = await this.usersService.create({
        email: dto.email,
        password: dto.password,
        firstName,
        lastName,
        role: { id: RoleEnum.parent },
        status: { id: StatusEnum.active },
      });
      parentUserId = parentUser.id as number;
    }

    const guardian = await this.guardianRepository.create({
      studentId,
      name: dto.name,
      phone: dto.phone,
      email: dto.email ?? null,
      relation: dto.relation,
      isPrimary: dto.isPrimary ?? false,
      ...(parentUserId ? { userId: parentUserId } : {}),
    } as any);

    return guardian;
  }

  /**
   * Get all guardians for a student.
   */
  async findGuardians(studentId: number) {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const allGuardians = await this.guardianRepository.findAll();
    return allGuardians.filter((g: any) => g.studentId === studentId);
  }

  /**
   * Get all documents for a student, optionally filtered by type.
   */
  async findDocuments(studentId: number, documentType?: string) {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const allDocs = await this.documentRepository.findAll();
    let docs = allDocs.filter((d: any) => d.studentId === studentId);

    if (documentType) {
      docs = docs.filter((d: any) => d.documentType === documentType);
    }

    return docs;
  }

  /**
   * Bulk import students from CSV.
   */
  async importStudents(
    buffer: Buffer,
    institutionId: number,
    filename: string,
  ) {
    // Parse and validate CSV
    const { validRows, errors } = this.importService.parseAndValidateCsv(
      buffer,
      filename,
    );

    let imported = 0;
    const importErrors = [...errors];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        await this.register(
          {
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            password: row.password,
            institutionId,
            dateOfBirth: row.dateOfBirth,
            gender: row.gender as any,
            guardianName: row.guardianName,
            guardianPhone: row.guardianPhone,
            guardianEmail: row.guardianEmail,
            guardianRelation: row.guardianRelation,
            address: row.address,
            city: row.city,
          },
          i,
        );
        imported++;
      } catch (err: any) {
        importErrors.push({
          row: i + 2, // offset for header + 0-index
          message: err.message || 'Unknown error',
        });
      }
    }

    return { imported, errors: importErrors };
  }
}
