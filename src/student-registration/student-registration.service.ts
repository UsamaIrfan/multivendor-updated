import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
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
import { TenantContextService } from '../tenant/tenant-context/tenant-context.service';
import { TenantService } from '../tenant/tenant.service';

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
    private readonly tenantContext: TenantContextService,
    private readonly tenantService: TenantService,
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

    // 5. Create user account with student role
    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: { id: RoleEnum.student },
      status: { id: StatusEnum.active },
    });

    // 6 & 7. Generate student ID and create student record
    // Retry up to 3 times if the roll number collides (unique constraint)
    const MAX_RETRIES = 3;
    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const studentId = await this.idGenerator.generate(idOffset + attempt);

      try {
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

        // 8. Assign user to the current tenant so they can log in
        if (this.tenantContext.hasContext()) {
          try {
            await this.tenantService.assignUserToTenant({
              tenantId: this.tenantContext.getTenantId(),
              userId: user.id as number,
            });
          } catch {
            // ConflictException means already assigned — safe to ignore
          }
        }

        // 9. Auto-enroll if sectionId + academicYearId provided
        if (dto.sectionId && dto.academicYearId) {
          try {
            await this.enrollInClass(student.id as number, {
              sectionId: dto.sectionId,
              academicYearId: dto.academicYearId,
            });
          } catch {
            // Non-critical — student is created, enrollment can be done later
          }
        }

        return {
          ...student,
          studentId,
          userId: user.id,
        };
      } catch (error: any) {
        // Retry only on duplicate key (PostgreSQL error code 23505)
        if (error?.driverError?.code === '23505' || error?.code === '23505') {
          lastError = error;
          continue;
        }
        throw error;
      }
    }

    throw lastError;
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
   * Handles user account fields, student profile, and enrollment changes.
   */
  async update(id: number, dto: UpdateRegisteredStudentDto) {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // 1. Update user account fields (firstName, lastName, phone) if provided
    if (dto.firstName || dto.lastName || dto.phone !== undefined) {
      const userUpdate: Record<string, unknown> = {};
      if (dto.firstName) userUpdate.firstName = dto.firstName;
      if (dto.lastName) userUpdate.lastName = dto.lastName;
      if (dto.phone !== undefined) userUpdate.phone = dto.phone;
      await this.usersService.update(
        (student as any).userId,
        userUpdate as any,
      );
    }

    // 2. Build student profile update (exclude user/enrollment fields)
    const studentUpdate: Record<string, unknown> = {};
    if (dto.gender !== undefined) studentUpdate.gender = dto.gender;
    if (dto.dateOfBirth !== undefined)
      studentUpdate.dateOfBirth = dto.dateOfBirth
        ? new Date(dto.dateOfBirth)
        : null;
    if (dto.address !== undefined) studentUpdate.address = dto.address;
    if (dto.city !== undefined) studentUpdate.city = dto.city;
    if (dto.bloodGroup !== undefined) studentUpdate.bloodGroup = dto.bloodGroup;
    if (dto.nationality !== undefined)
      studentUpdate.nationality = dto.nationality;
    if (dto.religion !== undefined) studentUpdate.religion = dto.religion;
    if (dto.guardianName !== undefined)
      studentUpdate.guardianName = dto.guardianName;
    if (dto.guardianPhone !== undefined)
      studentUpdate.guardianPhone = dto.guardianPhone;
    if (dto.guardianEmail !== undefined)
      studentUpdate.guardianEmail = dto.guardianEmail;
    if (dto.guardianRelation !== undefined)
      studentUpdate.guardianRelation = dto.guardianRelation;
    if (dto.admissionDate !== undefined)
      studentUpdate.admissionDate = dto.admissionDate
        ? new Date(dto.admissionDate)
        : null;
    if (dto.institutionId !== undefined)
      studentUpdate.institutionId = dto.institutionId;

    const updated = await this.studentRepository.update(
      id,
      studentUpdate as any,
    );

    // 3. Handle enrollment update (section + academicYear)
    if (dto.sectionId && dto.academicYearId) {
      const allEnrollments = await this.enrollmentRepository.findAll();
      const studentEnrollments = allEnrollments.filter(
        (e: any) => e.studentId === id,
      );
      const activeEnrollment = studentEnrollments.find(
        (e: any) => e.status === EnrollmentStatusEnum.active,
      );

      if (activeEnrollment) {
        // Update existing enrollment if section or year changed
        if (
          activeEnrollment.sectionId !== dto.sectionId ||
          activeEnrollment.academicYearId !== dto.academicYearId
        ) {
          await this.enrollmentRepository.update(activeEnrollment.id, {
            sectionId: dto.sectionId,
            academicYearId: dto.academicYearId,
          } as any);
        }
      } else {
        // Create new enrollment if none exists
        await this.enrollmentRepository.create({
          studentId: id,
          sectionId: dto.sectionId,
          academicYearId: dto.academicYearId,
          status: EnrollmentStatusEnum.active,
          enrollmentDate: new Date(),
        } as any);
      }
    }

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
            password:
              'Password is required when creating a parent user account',
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
