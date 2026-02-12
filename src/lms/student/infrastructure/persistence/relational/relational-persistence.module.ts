import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from './entities/student.entity';
import { AdmissionEnquiryEntity } from './entities/admission-enquiry.entity';
import { StudentDocumentEntity } from './entities/student-document.entity';
import { StudentEnrollmentEntity } from './entities/student-enrollment.entity';
import { StudentAttendanceEntity } from './entities/student-attendance.entity';
import { LeaveRequestEntity } from './entities/leave-request.entity';
import { FeeStructureEntity } from './entities/fee-structure.entity';
import { FeeChallanEntity } from './entities/fee-challan.entity';
import { FeePaymentEntity } from './entities/fee-payment.entity';
import { ExamEntity } from './entities/exam.entity';
import { ExamSubjectEntity } from './entities/exam-subject.entity';
import { ExamResultEntity } from './entities/exam-result.entity';
import { CourseMaterialEntity } from './entities/course-material.entity';

import { StudentRepository } from '../student.repository';
import { StudentRelationalRepository } from './repositories/student.repository';
import { AdmissionEnquiryRepository } from '../admission-enquiry.repository';
import { AdmissionEnquiryRelationalRepository } from './repositories/admission-enquiry.repository';
import { StudentDocumentRepository } from '../student-document.repository';
import { StudentDocumentRelationalRepository } from './repositories/student-document.repository';
import { StudentEnrollmentRepository } from '../student-enrollment.repository';
import { StudentEnrollmentRelationalRepository } from './repositories/student-enrollment.repository';
import { StudentAttendanceRepository } from '../student-attendance.repository';
import { StudentAttendanceRelationalRepository } from './repositories/student-attendance.repository';
import { LeaveRequestRepository } from '../leave-request.repository';
import { LeaveRequestRelationalRepository } from './repositories/leave-request.repository';
import { FeeStructureRepository } from '../fee-structure.repository';
import { FeeStructureRelationalRepository } from './repositories/fee-structure.repository';
import { FeeChallanRepository } from '../fee-challan.repository';
import { FeeChallanRelationalRepository } from './repositories/fee-challan.repository';
import { FeePaymentRepository } from '../fee-payment.repository';
import { FeePaymentRelationalRepository } from './repositories/fee-payment.repository';
import { ExamRepository } from '../exam.repository';
import { ExamRelationalRepository } from './repositories/exam.repository';
import { ExamSubjectRepository } from '../exam-subject.repository';
import { ExamSubjectRelationalRepository } from './repositories/exam-subject.repository';
import { ExamResultRepository } from '../exam-result.repository';
import { ExamResultRelationalRepository } from './repositories/exam-result.repository';
import { CourseMaterialRepository } from '../course-material.repository';
import { CourseMaterialRelationalRepository } from './repositories/course-material.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentEntity,
      AdmissionEnquiryEntity,
      StudentDocumentEntity,
      StudentEnrollmentEntity,
      StudentAttendanceEntity,
      LeaveRequestEntity,
      FeeStructureEntity,
      FeeChallanEntity,
      FeePaymentEntity,
      ExamEntity,
      ExamSubjectEntity,
      ExamResultEntity,
      CourseMaterialEntity,
    ]),
  ],
  providers: [
    { provide: StudentRepository, useClass: StudentRelationalRepository },
    {
      provide: AdmissionEnquiryRepository,
      useClass: AdmissionEnquiryRelationalRepository,
    },
    {
      provide: StudentDocumentRepository,
      useClass: StudentDocumentRelationalRepository,
    },
    {
      provide: StudentEnrollmentRepository,
      useClass: StudentEnrollmentRelationalRepository,
    },
    {
      provide: StudentAttendanceRepository,
      useClass: StudentAttendanceRelationalRepository,
    },
    {
      provide: LeaveRequestRepository,
      useClass: LeaveRequestRelationalRepository,
    },
    {
      provide: FeeStructureRepository,
      useClass: FeeStructureRelationalRepository,
    },
    {
      provide: FeeChallanRepository,
      useClass: FeeChallanRelationalRepository,
    },
    {
      provide: FeePaymentRepository,
      useClass: FeePaymentRelationalRepository,
    },
    { provide: ExamRepository, useClass: ExamRelationalRepository },
    {
      provide: ExamSubjectRepository,
      useClass: ExamSubjectRelationalRepository,
    },
    {
      provide: ExamResultRepository,
      useClass: ExamResultRelationalRepository,
    },
    {
      provide: CourseMaterialRepository,
      useClass: CourseMaterialRelationalRepository,
    },
  ],
  exports: [
    StudentRepository,
    AdmissionEnquiryRepository,
    StudentDocumentRepository,
    StudentEnrollmentRepository,
    StudentAttendanceRepository,
    LeaveRequestRepository,
    FeeStructureRepository,
    FeeChallanRepository,
    FeePaymentRepository,
    ExamRepository,
    ExamSubjectRepository,
    ExamResultRepository,
    CourseMaterialRepository,
  ],
})
export class StudentRelationalPersistenceModule {}
