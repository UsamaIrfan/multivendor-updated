import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../roles/roles.decorator';
import { RolesGuard } from '../../roles/roles.guard';
import { RoleEnum } from '../../roles/roles.enum';
import { StudentService } from './student.service';

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

// ═══════════════════════════════════════════════════════════
//  Students
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Students')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/students', version: '1' })
export class StudentController {
  constructor(private readonly service: StudentService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Student created' })
  create(@Body() dto: CreateStudentDto) {
    return this.service.createStudent(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all students' })
  findAll() {
    return this.service.findAllStudents();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneStudent(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentDto) {
    return this.service.updateStudent(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeStudent(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Admission Enquiries
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Admission Enquiries')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/admission-enquiries', version: '1' })
export class AdmissionEnquiryController {
  constructor(private readonly service: StudentService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Admission enquiry created' })
  create(@Body() dto: CreateAdmissionEnquiryDto) {
    return this.service.createAdmissionEnquiry(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all admission enquiries' })
  findAll() {
    return this.service.findAllAdmissionEnquiries();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneAdmissionEnquiry(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdmissionEnquiryDto,
  ) {
    return this.service.updateAdmissionEnquiry(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeAdmissionEnquiry(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Student Documents
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Student Documents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/student-documents', version: '1' })
export class StudentDocumentController {
  constructor(private readonly service: StudentService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Student document created' })
  create(@Body() dto: CreateStudentDocumentDto) {
    return this.service.createStudentDocument(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all student documents' })
  findAll() {
    return this.service.findAllStudentDocuments();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneStudentDocument(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDocumentDto,
  ) {
    return this.service.updateStudentDocument(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeStudentDocument(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Student Enrollments
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Student Enrollments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/student-enrollments', version: '1' })
export class StudentEnrollmentController {
  constructor(private readonly service: StudentService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Student enrollment created' })
  create(@Body() dto: CreateStudentEnrollmentDto) {
    return this.service.createStudentEnrollment(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all student enrollments' })
  findAll() {
    return this.service.findAllStudentEnrollments();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneStudentEnrollment(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentEnrollmentDto,
  ) {
    return this.service.updateStudentEnrollment(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeStudentEnrollment(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Student Attendance
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Student Attendance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/student-attendance', version: '1' })
export class StudentAttendanceController {
  constructor(private readonly service: StudentService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Student attendance created' })
  create(@Body() dto: CreateStudentAttendanceDto) {
    return this.service.createStudentAttendance(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all student attendance records' })
  findAll() {
    return this.service.findAllStudentAttendances();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneStudentAttendance(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentAttendanceDto,
  ) {
    return this.service.updateStudentAttendance(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeStudentAttendance(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Leave Requests
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Leave Requests')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/leave-requests', version: '1' })
export class LeaveRequestController {
  constructor(private readonly service: StudentService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher, RoleEnum.student, RoleEnum.parent)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Leave request created' })
  create(@Body() dto: CreateLeaveRequestDto) {
    return this.service.createLeaveRequest(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all leave requests' })
  findAll() {
    return this.service.findAllLeaveRequests();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher, RoleEnum.student, RoleEnum.parent)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneLeaveRequest(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeaveRequestDto,
  ) {
    return this.service.updateLeaveRequest(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeLeaveRequest(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Fee Structures
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Fee Structures')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/fee-structures', version: '1' })
export class FeeStructureController {
  constructor(private readonly service: StudentService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Fee structure created' })
  create(@Body() dto: CreateFeeStructureDto) {
    return this.service.createFeeStructure(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all fee structures' })
  findAll() {
    return this.service.findAllFeeStructures();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneFeeStructure(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFeeStructureDto,
  ) {
    return this.service.updateFeeStructure(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeFeeStructure(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Fee Challans
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Fee Challans')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/fee-challans', version: '1' })
export class FeeChallanController {
  constructor(private readonly service: StudentService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Fee challan created' })
  create(@Body() dto: CreateFeeChallanDto) {
    return this.service.createFeeChallan(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all fee challans' })
  findAll() {
    return this.service.findAllFeeChallans();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneFeeChallan(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFeeChallanDto,
  ) {
    return this.service.updateFeeChallan(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeFeeChallan(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Fee Payments
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Fee Payments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/fee-payments', version: '1' })
export class FeePaymentController {
  constructor(private readonly service: StudentService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Fee payment created' })
  create(@Body() dto: CreateFeePaymentDto) {
    return this.service.createFeePayment(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all fee payments' })
  findAll() {
    return this.service.findAllFeePayments();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneFeePayment(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.accountant)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFeePaymentDto,
  ) {
    return this.service.updateFeePayment(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeFeePayment(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Exams
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Exams')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/exams', version: '1' })
export class ExamController {
  constructor(private readonly service: StudentService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Exam created' })
  create(@Body() dto: CreateExamDto) {
    return this.service.createExam(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all exams' })
  findAll() {
    return this.service.findAllExams();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneExam(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExamDto) {
    return this.service.updateExam(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeExam(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Exam Subjects
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Exam Subjects')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/exam-subjects', version: '1' })
export class ExamSubjectController {
  constructor(private readonly service: StudentService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Exam subject created' })
  create(@Body() dto: CreateExamSubjectDto) {
    return this.service.createExamSubject(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all exam subjects' })
  findAll() {
    return this.service.findAllExamSubjects();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneExamSubject(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamSubjectDto,
  ) {
    return this.service.updateExamSubject(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeExamSubject(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Exam Results
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Exam Results')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/exam-results', version: '1' })
export class ExamResultController {
  constructor(private readonly service: StudentService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Exam result created' })
  create(@Body() dto: CreateExamResultDto) {
    return this.service.createExamResult(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all exam results' })
  findAll() {
    return this.service.findAllExamResults();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher, RoleEnum.student, RoleEnum.parent)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneExamResult(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamResultDto,
  ) {
    return this.service.updateExamResult(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeExamResult(id);
  }
}

// ═══════════════════════════════════════════════════════════
//  Course Materials
// ═══════════════════════════════════════════════════════════
@ApiTags('LMS - Course Materials')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({ path: 'lms/course-materials', version: '1' })
export class CourseMaterialController {
  constructor(private readonly service: StudentService) {}

  @Post()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Course material created' })
  create(@Body() dto: CreateCourseMaterialDto) {
    return this.service.createCourseMaterial(dto);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher, RoleEnum.student)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'List all course materials' })
  findAll() {
    return this.service.findAllCourseMaterials();
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher, RoleEnum.student)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneCourseMaterial(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin, RoleEnum.staff, RoleEnum.teacher)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseMaterialDto,
  ) {
    return this.service.updateCourseMaterial(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeCourseMaterial(id);
  }
}
