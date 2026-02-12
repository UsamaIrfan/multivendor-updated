import { Module } from '@nestjs/common';
import { StudentRelationalPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { StudentService } from './student.service';
import {
  StudentController,
  AdmissionEnquiryController,
  StudentDocumentController,
  StudentEnrollmentController,
  StudentAttendanceController,
  LeaveRequestController,
  FeeStructureController,
  FeeChallanController,
  FeePaymentController,
  ExamController,
  ExamSubjectController,
  ExamResultController,
  CourseMaterialController,
} from './student.controller';

@Module({
  imports: [StudentRelationalPersistenceModule],
  controllers: [
    StudentController,
    AdmissionEnquiryController,
    StudentDocumentController,
    StudentEnrollmentController,
    StudentAttendanceController,
    LeaveRequestController,
    FeeStructureController,
    FeeChallanController,
    FeePaymentController,
    ExamController,
    ExamSubjectController,
    ExamResultController,
    CourseMaterialController,
  ],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
