import { Injectable, NotFoundException } from '@nestjs/common';

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

import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateAdmissionEnquiryDto } from './dto/create-admission-enquiry.dto';
import { UpdateAdmissionEnquiryDto } from './dto/update-admission-enquiry.dto';
import { CreateStudentDocumentDto } from './dto/create-student-document.dto';
import { UpdateStudentDocumentDto } from './dto/update-student-document.dto';
import { CreateStudentEnrollmentDto } from './dto/create-student-enrollment.dto';
import { UpdateStudentEnrollmentDto } from './dto/update-student-enrollment.dto';
import { CreateStudentAttendanceDto } from './dto/create-student-attendance.dto';
import { UpdateStudentAttendanceDto } from './dto/update-student-attendance.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto';
import { CreateFeeChallanDto } from './dto/create-fee-challan.dto';
import { UpdateFeeChallanDto } from './dto/update-fee-challan.dto';
import { CreateFeePaymentDto } from './dto/create-fee-payment.dto';
import { UpdateFeePaymentDto } from './dto/update-fee-payment.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateExamSubjectDto } from './dto/create-exam-subject.dto';
import { UpdateExamSubjectDto } from './dto/update-exam-subject.dto';
import { CreateExamResultDto } from './dto/create-exam-result.dto';
import { UpdateExamResultDto } from './dto/update-exam-result.dto';
import { CreateCourseMaterialDto } from './dto/create-course-material.dto';
import { UpdateCourseMaterialDto } from './dto/update-course-material.dto';

@Injectable()
export class StudentService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly admissionEnquiryRepository: AdmissionEnquiryRepository,
    private readonly studentDocumentRepository: StudentDocumentRepository,
    private readonly studentEnrollmentRepository: StudentEnrollmentRepository,
    private readonly studentAttendanceRepository: StudentAttendanceRepository,
    private readonly leaveRequestRepository: LeaveRequestRepository,
    private readonly feeStructureRepository: FeeStructureRepository,
    private readonly feeChallanRepository: FeeChallanRepository,
    private readonly feePaymentRepository: FeePaymentRepository,
    private readonly examRepository: ExamRepository,
    private readonly examSubjectRepository: ExamSubjectRepository,
    private readonly examResultRepository: ExamResultRepository,
    private readonly courseMaterialRepository: CourseMaterialRepository,
  ) {}

  // ─── Student ──────────────────────────────────────────
  createStudent(dto: CreateStudentDto) {
    return this.studentRepository.create(dto);
  }

  findAllStudents() {
    return this.studentRepository.findAll();
  }

  async findOneStudent(id: number) {
    const student = await this.studentRepository.findById(id);
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async updateStudent(id: number, dto: UpdateStudentDto) {
    await this.findOneStudent(id);
    return this.studentRepository.update(id, dto);
  }

  async removeStudent(id: number) {
    await this.findOneStudent(id);
    return this.studentRepository.remove(id);
  }

  // ─── Admission Enquiry ────────────────────────────────
  createAdmissionEnquiry(dto: CreateAdmissionEnquiryDto) {
    return this.admissionEnquiryRepository.create(dto);
  }

  findAllAdmissionEnquiries() {
    return this.admissionEnquiryRepository.findAll();
  }

  async findOneAdmissionEnquiry(id: number) {
    const enquiry = await this.admissionEnquiryRepository.findById(id);
    if (!enquiry) throw new NotFoundException('Admission enquiry not found');
    return enquiry;
  }

  async updateAdmissionEnquiry(id: number, dto: UpdateAdmissionEnquiryDto) {
    await this.findOneAdmissionEnquiry(id);
    return this.admissionEnquiryRepository.update(id, dto);
  }

  async removeAdmissionEnquiry(id: number) {
    await this.findOneAdmissionEnquiry(id);
    return this.admissionEnquiryRepository.remove(id);
  }

  // ─── Student Document ─────────────────────────────────
  createStudentDocument(dto: CreateStudentDocumentDto) {
    return this.studentDocumentRepository.create(dto);
  }

  findAllStudentDocuments() {
    return this.studentDocumentRepository.findAll();
  }

  async findOneStudentDocument(id: number) {
    const doc = await this.studentDocumentRepository.findById(id);
    if (!doc) throw new NotFoundException('Student document not found');
    return doc;
  }

  async updateStudentDocument(id: number, dto: UpdateStudentDocumentDto) {
    await this.findOneStudentDocument(id);
    return this.studentDocumentRepository.update(id, dto);
  }

  async removeStudentDocument(id: number) {
    await this.findOneStudentDocument(id);
    return this.studentDocumentRepository.remove(id);
  }

  // ─── Student Enrollment ───────────────────────────────
  createStudentEnrollment(dto: CreateStudentEnrollmentDto) {
    return this.studentEnrollmentRepository.create(dto);
  }

  findAllStudentEnrollments() {
    return this.studentEnrollmentRepository.findAll();
  }

  async findOneStudentEnrollment(id: number) {
    const enrollment = await this.studentEnrollmentRepository.findById(id);
    if (!enrollment)
      throw new NotFoundException('Student enrollment not found');
    return enrollment;
  }

  async updateStudentEnrollment(id: number, dto: UpdateStudentEnrollmentDto) {
    await this.findOneStudentEnrollment(id);
    return this.studentEnrollmentRepository.update(id, dto);
  }

  async removeStudentEnrollment(id: number) {
    await this.findOneStudentEnrollment(id);
    return this.studentEnrollmentRepository.remove(id);
  }

  // ─── Student Attendance ───────────────────────────────
  createStudentAttendance(dto: CreateStudentAttendanceDto) {
    return this.studentAttendanceRepository.create(dto);
  }

  findAllStudentAttendances() {
    return this.studentAttendanceRepository.findAll();
  }

  async findOneStudentAttendance(id: number) {
    const attendance = await this.studentAttendanceRepository.findById(id);
    if (!attendance)
      throw new NotFoundException('Student attendance not found');
    return attendance;
  }

  async updateStudentAttendance(id: number, dto: UpdateStudentAttendanceDto) {
    await this.findOneStudentAttendance(id);
    return this.studentAttendanceRepository.update(id, dto);
  }

  async removeStudentAttendance(id: number) {
    await this.findOneStudentAttendance(id);
    return this.studentAttendanceRepository.remove(id);
  }

  // ─── Leave Request ────────────────────────────────────
  createLeaveRequest(dto: CreateLeaveRequestDto) {
    return this.leaveRequestRepository.create(dto);
  }

  findAllLeaveRequests() {
    return this.leaveRequestRepository.findAll();
  }

  async findOneLeaveRequest(id: number) {
    const request = await this.leaveRequestRepository.findById(id);
    if (!request) throw new NotFoundException('Leave request not found');
    return request;
  }

  async updateLeaveRequest(id: number, dto: UpdateLeaveRequestDto) {
    await this.findOneLeaveRequest(id);
    return this.leaveRequestRepository.update(id, dto);
  }

  async removeLeaveRequest(id: number) {
    await this.findOneLeaveRequest(id);
    return this.leaveRequestRepository.remove(id);
  }

  // ─── Fee Structure ────────────────────────────────────
  createFeeStructure(dto: CreateFeeStructureDto) {
    return this.feeStructureRepository.create(dto);
  }

  findAllFeeStructures() {
    return this.feeStructureRepository.findAll();
  }

  async findOneFeeStructure(id: number) {
    const structure = await this.feeStructureRepository.findById(id);
    if (!structure) throw new NotFoundException('Fee structure not found');
    return structure;
  }

  async updateFeeStructure(id: number, dto: UpdateFeeStructureDto) {
    await this.findOneFeeStructure(id);
    return this.feeStructureRepository.update(id, dto);
  }

  async removeFeeStructure(id: number) {
    await this.findOneFeeStructure(id);
    return this.feeStructureRepository.remove(id);
  }

  // ─── Fee Challan ──────────────────────────────────────
  createFeeChallan(dto: CreateFeeChallanDto) {
    return this.feeChallanRepository.create(dto);
  }

  findAllFeeChallans() {
    return this.feeChallanRepository.findAll();
  }

  async findOneFeeChallan(id: number) {
    const challan = await this.feeChallanRepository.findById(id);
    if (!challan) throw new NotFoundException('Fee challan not found');
    return challan;
  }

  async updateFeeChallan(id: number, dto: UpdateFeeChallanDto) {
    await this.findOneFeeChallan(id);
    return this.feeChallanRepository.update(id, dto);
  }

  async removeFeeChallan(id: number) {
    await this.findOneFeeChallan(id);
    return this.feeChallanRepository.remove(id);
  }

  // ─── Fee Payment ──────────────────────────────────────
  createFeePayment(dto: CreateFeePaymentDto) {
    return this.feePaymentRepository.create(dto);
  }

  findAllFeePayments() {
    return this.feePaymentRepository.findAll();
  }

  async findOneFeePayment(id: number) {
    const payment = await this.feePaymentRepository.findById(id);
    if (!payment) throw new NotFoundException('Fee payment not found');
    return payment;
  }

  async updateFeePayment(id: number, dto: UpdateFeePaymentDto) {
    await this.findOneFeePayment(id);
    return this.feePaymentRepository.update(id, dto);
  }

  async removeFeePayment(id: number) {
    await this.findOneFeePayment(id);
    return this.feePaymentRepository.remove(id);
  }

  // ─── Exam ─────────────────────────────────────────────
  createExam(dto: CreateExamDto) {
    return this.examRepository.create(dto);
  }

  findAllExams() {
    return this.examRepository.findAll();
  }

  async findOneExam(id: number) {
    const exam = await this.examRepository.findById(id);
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async updateExam(id: number, dto: UpdateExamDto) {
    await this.findOneExam(id);
    return this.examRepository.update(id, dto);
  }

  async removeExam(id: number) {
    await this.findOneExam(id);
    return this.examRepository.remove(id);
  }

  // ─── Exam Subject ─────────────────────────────────────
  createExamSubject(dto: CreateExamSubjectDto) {
    return this.examSubjectRepository.create(dto);
  }

  findAllExamSubjects() {
    return this.examSubjectRepository.findAll();
  }

  async findOneExamSubject(id: number) {
    const examSubject = await this.examSubjectRepository.findById(id);
    if (!examSubject) throw new NotFoundException('Exam subject not found');
    return examSubject;
  }

  async updateExamSubject(id: number, dto: UpdateExamSubjectDto) {
    await this.findOneExamSubject(id);
    return this.examSubjectRepository.update(id, dto);
  }

  async removeExamSubject(id: number) {
    await this.findOneExamSubject(id);
    return this.examSubjectRepository.remove(id);
  }

  // ─── Exam Result ──────────────────────────────────────
  createExamResult(dto: CreateExamResultDto) {
    return this.examResultRepository.create(dto);
  }

  findAllExamResults() {
    return this.examResultRepository.findAll();
  }

  async findOneExamResult(id: number) {
    const result = await this.examResultRepository.findById(id);
    if (!result) throw new NotFoundException('Exam result not found');
    return result;
  }

  async updateExamResult(id: number, dto: UpdateExamResultDto) {
    await this.findOneExamResult(id);
    return this.examResultRepository.update(id, dto);
  }

  async removeExamResult(id: number) {
    await this.findOneExamResult(id);
    return this.examResultRepository.remove(id);
  }

  // ─── Course Material ──────────────────────────────────
  createCourseMaterial(dto: CreateCourseMaterialDto) {
    return this.courseMaterialRepository.create(dto);
  }

  findAllCourseMaterials() {
    return this.courseMaterialRepository.findAll();
  }

  async findOneCourseMaterial(id: number) {
    const material = await this.courseMaterialRepository.findById(id);
    if (!material) throw new NotFoundException('Course material not found');
    return material;
  }

  async updateCourseMaterial(id: number, dto: UpdateCourseMaterialDto) {
    await this.findOneCourseMaterial(id);
    return this.courseMaterialRepository.update(id, dto);
  }

  async removeCourseMaterial(id: number) {
    await this.findOneCourseMaterial(id);
    return this.courseMaterialRepository.remove(id);
  }
}
