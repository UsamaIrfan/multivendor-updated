import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentRepository } from './infrastructure/persistence/student.repository';
import { AdmissionEnquiryRepository } from './infrastructure/persistence/admission-enquiry.repository';
import { StudentDocumentRepository } from './infrastructure/persistence/student-document.repository';
import { StudentEnrollmentRepository } from './infrastructure/persistence/student-enrollment.repository';
import { StudentAttendanceRepository } from './infrastructure/persistence/student-attendance.repository';
import { LeaveRequestRepository } from './infrastructure/persistence/leave-request.repository';
import { FeeStructureRepository } from './infrastructure/persistence/fee-structure.repository';
import { FeeChallanRepository } from './infrastructure/persistence/fee-challan.repository';
import { FeePaymentRepository } from './infrastructure/persistence/fee-payment.repository';
import { ExamRepository } from './infrastructure/persistence/exam.repository';
import { ExamSubjectRepository } from './infrastructure/persistence/exam-subject.repository';
import { ExamResultRepository } from './infrastructure/persistence/exam-result.repository';
import { CourseMaterialRepository } from './infrastructure/persistence/course-material.repository';

function createMockRepository() {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

describe('StudentService', () => {
  let service: StudentService;
  let studentRepo: ReturnType<typeof createMockRepository>;
  let admissionEnquiryRepo: ReturnType<typeof createMockRepository>;
  let studentDocumentRepo: ReturnType<typeof createMockRepository>;
  let studentEnrollmentRepo: ReturnType<typeof createMockRepository>;
  let studentAttendanceRepo: ReturnType<typeof createMockRepository>;
  let leaveRequestRepo: ReturnType<typeof createMockRepository>;
  let feeStructureRepo: ReturnType<typeof createMockRepository>;
  let feeChallanRepo: ReturnType<typeof createMockRepository>;
  let feePaymentRepo: ReturnType<typeof createMockRepository>;
  let examRepo: ReturnType<typeof createMockRepository>;
  let examSubjectRepo: ReturnType<typeof createMockRepository>;
  let examResultRepo: ReturnType<typeof createMockRepository>;
  let courseMaterialRepo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    studentRepo = createMockRepository();
    admissionEnquiryRepo = createMockRepository();
    studentDocumentRepo = createMockRepository();
    studentEnrollmentRepo = createMockRepository();
    studentAttendanceRepo = createMockRepository();
    leaveRequestRepo = createMockRepository();
    feeStructureRepo = createMockRepository();
    feeChallanRepo = createMockRepository();
    feePaymentRepo = createMockRepository();
    examRepo = createMockRepository();
    examSubjectRepo = createMockRepository();
    examResultRepo = createMockRepository();
    courseMaterialRepo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: StudentRepository, useValue: studentRepo },
        { provide: AdmissionEnquiryRepository, useValue: admissionEnquiryRepo },
        { provide: StudentDocumentRepository, useValue: studentDocumentRepo },
        {
          provide: StudentEnrollmentRepository,
          useValue: studentEnrollmentRepo,
        },
        {
          provide: StudentAttendanceRepository,
          useValue: studentAttendanceRepo,
        },
        { provide: LeaveRequestRepository, useValue: leaveRequestRepo },
        { provide: FeeStructureRepository, useValue: feeStructureRepo },
        { provide: FeeChallanRepository, useValue: feeChallanRepo },
        { provide: FeePaymentRepository, useValue: feePaymentRepo },
        { provide: ExamRepository, useValue: examRepo },
        { provide: ExamSubjectRepository, useValue: examSubjectRepo },
        { provide: ExamResultRepository, useValue: examResultRepo },
        { provide: CourseMaterialRepository, useValue: courseMaterialRepo },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Helper to test a standard CRUD entity group
  function describeCrudEntity(
    entityName: string,
    mockEntity: Record<string, any>,
    getRepo: () => ReturnType<typeof createMockRepository>,
    serviceMethods: {
      create: (dto: any) => Promise<any>;
      findAll: () => Promise<any>;
      findOne: (id: number) => Promise<any>;
      update: (id: number, dto: any) => Promise<any>;
      remove: (id: number) => Promise<any>;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _notFoundMessage: string,
  ) {
    describe(entityName, () => {
      describe(`create${entityName}`, () => {
        // eslint-disable-next-line no-restricted-syntax
        it(`should create a ${entityName.toLowerCase()}`, async () => {
          getRepo().create.mockResolvedValue(mockEntity);
          const result = await serviceMethods.create(mockEntity);
          expect(result).toEqual(mockEntity);
          expect(getRepo().create).toHaveBeenCalled();
        });
      });

      describe(`findAll${entityName}s`, () => {
        // eslint-disable-next-line no-restricted-syntax
        it(`should return all ${entityName.toLowerCase()}s`, async () => {
          getRepo().findAll.mockResolvedValue([mockEntity]);
          const result = await serviceMethods.findAll();
          expect(result).toEqual([mockEntity]);
        });
      });

      describe(`findOne${entityName}`, () => {
        // eslint-disable-next-line no-restricted-syntax
        it(`should return a ${entityName.toLowerCase()} by id`, async () => {
          getRepo().findById.mockResolvedValue(mockEntity);
          const result = await serviceMethods.findOne(1);
          expect(result).toEqual(mockEntity);
        });

        it('should throw NotFoundException if not found', async () => {
          getRepo().findById.mockResolvedValue(null);
          await expect(serviceMethods.findOne(999)).rejects.toThrow(
            NotFoundException,
          );
        });
      });

      describe(`update${entityName}`, () => {
        // eslint-disable-next-line no-restricted-syntax
        it(`should update a ${entityName.toLowerCase()}`, async () => {
          getRepo().findById.mockResolvedValue(mockEntity);
          getRepo().update.mockResolvedValue({ ...mockEntity, updated: true });
          const result = await serviceMethods.update(1, { updated: true });
          expect(result).toBeDefined();
        });

        it('should throw NotFoundException if not found', async () => {
          getRepo().findById.mockResolvedValue(null);
          await expect(serviceMethods.update(999, {})).rejects.toThrow(
            NotFoundException,
          );
        });
      });

      describe(`remove${entityName}`, () => {
        // eslint-disable-next-line no-restricted-syntax
        it(`should remove a ${entityName.toLowerCase()}`, async () => {
          getRepo().findById.mockResolvedValue(mockEntity);
          getRepo().remove.mockResolvedValue(undefined);
          await expect(serviceMethods.remove(1)).resolves.toBeUndefined();
        });

        it('should throw NotFoundException if not found', async () => {
          getRepo().findById.mockResolvedValue(null);
          await expect(serviceMethods.remove(999)).rejects.toThrow(
            NotFoundException,
          );
        });
      });
    });
  }

  // ─── Student ──────────────────────────────────────────
  describeCrudEntity(
    'Student',
    { id: 1, rollNumber: 'STU-001' },
    () => studentRepo,
    {
      create: (dto) => service.createStudent(dto),
      findAll: () => service.findAllStudents(),
      findOne: (id) => service.findOneStudent(id),
      update: (id, dto) => service.updateStudent(id, dto),
      remove: (id) => service.removeStudent(id),
    },
    'Student not found',
  );

  // ─── Admission Enquiry ────────────────────────────────
  describeCrudEntity(
    'AdmissionEnquiry',
    { id: 1, studentName: 'John' },
    () => admissionEnquiryRepo,
    {
      create: (dto) => service.createAdmissionEnquiry(dto),
      findAll: () => service.findAllAdmissionEnquiries(),
      findOne: (id) => service.findOneAdmissionEnquiry(id),
      update: (id, dto) => service.updateAdmissionEnquiry(id, dto),
      remove: (id) => service.removeAdmissionEnquiry(id),
    },
    'Admission enquiry not found',
  );

  // ─── Student Document ─────────────────────────────────
  describeCrudEntity(
    'StudentDocument',
    { id: 1, documentType: 'Birth Certificate' },
    () => studentDocumentRepo,
    {
      create: (dto) => service.createStudentDocument(dto),
      findAll: () => service.findAllStudentDocuments(),
      findOne: (id) => service.findOneStudentDocument(id),
      update: (id, dto) => service.updateStudentDocument(id, dto),
      remove: (id) => service.removeStudentDocument(id),
    },
    'Student document not found',
  );

  // ─── Student Enrollment ───────────────────────────────
  describeCrudEntity(
    'StudentEnrollment',
    { id: 1, status: 'active' },
    () => studentEnrollmentRepo,
    {
      create: (dto) => service.createStudentEnrollment(dto),
      findAll: () => service.findAllStudentEnrollments(),
      findOne: (id) => service.findOneStudentEnrollment(id),
      update: (id, dto) => service.updateStudentEnrollment(id, dto),
      remove: (id) => service.removeStudentEnrollment(id),
    },
    'Student enrollment not found',
  );

  // ─── Student Attendance ───────────────────────────────
  describeCrudEntity(
    'StudentAttendance',
    { id: 1, status: 'present' },
    () => studentAttendanceRepo,
    {
      create: (dto) => service.createStudentAttendance(dto),
      findAll: () => service.findAllStudentAttendances(),
      findOne: (id) => service.findOneStudentAttendance(id),
      update: (id, dto) => service.updateStudentAttendance(id, dto),
      remove: (id) => service.removeStudentAttendance(id),
    },
    'Student attendance not found',
  );

  // ─── Leave Request ────────────────────────────────────
  describeCrudEntity(
    'LeaveRequest',
    { id: 1, reason: 'Sick' },
    () => leaveRequestRepo,
    {
      create: (dto) => service.createLeaveRequest(dto),
      findAll: () => service.findAllLeaveRequests(),
      findOne: (id) => service.findOneLeaveRequest(id),
      update: (id, dto) => service.updateLeaveRequest(id, dto),
      remove: (id) => service.removeLeaveRequest(id),
    },
    'Leave request not found',
  );

  // ─── Fee Structure ────────────────────────────────────
  describeCrudEntity(
    'FeeStructure',
    { id: 1, name: 'Tuition' },
    () => feeStructureRepo,
    {
      create: (dto) => service.createFeeStructure(dto),
      findAll: () => service.findAllFeeStructures(),
      findOne: (id) => service.findOneFeeStructure(id),
      update: (id, dto) => service.updateFeeStructure(id, dto),
      remove: (id) => service.removeFeeStructure(id),
    },
    'Fee structure not found',
  );

  // ─── Fee Challan ──────────────────────────────────────
  describeCrudEntity(
    'FeeChallan',
    { id: 1, amount: 5000 },
    () => feeChallanRepo,
    {
      create: (dto) => service.createFeeChallan(dto),
      findAll: () => service.findAllFeeChallans(),
      findOne: (id) => service.findOneFeeChallan(id),
      update: (id, dto) => service.updateFeeChallan(id, dto),
      remove: (id) => service.removeFeeChallan(id),
    },
    'Fee challan not found',
  );

  // ─── Fee Payment ──────────────────────────────────────
  describeCrudEntity(
    'FeePayment',
    { id: 1, amount: 5000 },
    () => feePaymentRepo,
    {
      create: (dto) => service.createFeePayment(dto),
      findAll: () => service.findAllFeePayments(),
      findOne: (id) => service.findOneFeePayment(id),
      update: (id, dto) => service.updateFeePayment(id, dto),
      remove: (id) => service.removeFeePayment(id),
    },
    'Fee payment not found',
  );

  // ─── Exam ─────────────────────────────────────────────
  describeCrudEntity(
    'Exam',
    { id: 1, name: 'Midterm' },
    () => examRepo,
    {
      create: (dto) => service.createExam(dto),
      findAll: () => service.findAllExams(),
      findOne: (id) => service.findOneExam(id),
      update: (id, dto) => service.updateExam(id, dto),
      remove: (id) => service.removeExam(id),
    },
    'Exam not found',
  );

  // ─── Exam Subject ─────────────────────────────────────
  describeCrudEntity(
    'ExamSubject',
    { id: 1, maxMarks: 100 },
    () => examSubjectRepo,
    {
      create: (dto) => service.createExamSubject(dto),
      findAll: () => service.findAllExamSubjects(),
      findOne: (id) => service.findOneExamSubject(id),
      update: (id, dto) => service.updateExamSubject(id, dto),
      remove: (id) => service.removeExamSubject(id),
    },
    'Exam subject not found',
  );

  // ─── Exam Result ──────────────────────────────────────
  describeCrudEntity(
    'ExamResult',
    { id: 1, marksObtained: 85 },
    () => examResultRepo,
    {
      create: (dto) => service.createExamResult(dto),
      findAll: () => service.findAllExamResults(),
      findOne: (id) => service.findOneExamResult(id),
      update: (id, dto) => service.updateExamResult(id, dto),
      remove: (id) => service.removeExamResult(id),
    },
    'Exam result not found',
  );

  // ─── Course Material ──────────────────────────────────
  describeCrudEntity(
    'CourseMaterial',
    { id: 1, title: 'Chapter 1' },
    () => courseMaterialRepo,
    {
      create: (dto) => service.createCourseMaterial(dto),
      findAll: () => service.findAllCourseMaterials(),
      findOne: (id) => service.findOneCourseMaterial(id),
      update: (id, dto) => service.updateCourseMaterial(id, dto),
      remove: (id) => service.removeCourseMaterial(id),
    },
    'Course material not found',
  );
});
