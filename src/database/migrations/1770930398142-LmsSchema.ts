import { MigrationInterface, QueryRunner } from 'typeorm';

export class LmsSchema1770930398142 implements MigrationInterface {
  name = 'LmsSchema1770930398142';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "term" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "academicYearId" integer, CONSTRAINT "PK_55b0479f0743f2e5d5ec414821e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "academic_year" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "isCurrent" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "institutionId" integer, CONSTRAINT "PK_ebe672580520ed92b9e89088325" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2ee52964ade76cfd35de4e5f48" ON "academic_year" ("institutionId", "name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "subject" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "creditHours" integer NOT NULL DEFAULT '0', "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "departmentId" integer, CONSTRAINT "PK_12eee115462e38d62e5455fc054" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_542c3a24d2c56cfeabfaff7c21" ON "subject" ("departmentId", "code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "department" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "institutionId" integer, CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_bcb15da75a092d57f656b96fbe" ON "department" ("institutionId", "code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "section" ("id" SERIAL NOT NULL, "classTeacherId" integer, "name" character varying NOT NULL, "capacity" integer NOT NULL DEFAULT '40', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "gradeClassId" integer, CONSTRAINT "PK_3c41d2d699384cc5e8eac54777d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_bfe1bef5be8b341b3c134c2306" ON "section" ("gradeClassId", "name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "grade_class" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "numericGrade" integer, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "institutionId" integer, CONSTRAINT "PK_93f84e7fcef26f56ce90bd93963" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_7af2ae6aa0953928fb87600fb9" ON "grade_class" ("institutionId", "name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "institution" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "address" character varying, "city" character varying, "state" character varying, "country" character varying, "phone" character varying, "email" character varying, "website" character varying, "logo" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_505d00ce02e2c67d3e0df4c72fa" UNIQUE ("code"), CONSTRAINT "PK_f60ee4ff0719b7df54830b39087" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d218ad3566afa9e396f184fd7d" ON "institution" ("name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_505d00ce02e2c67d3e0df4c72f" ON "institution" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "student_document" ("id" SERIAL NOT NULL, "documentType" character varying NOT NULL, "isVerified" boolean NOT NULL DEFAULT false, "remarks" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "studentId" integer, "fileId" uuid, CONSTRAINT "PK_2c9db77bec5d1700ab0db7d6476" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."student_attendance_status_enum" AS ENUM('present', 'absent', 'late', 'half_day', 'excused')`,
    );
    await queryRunner.query(
      `CREATE TABLE "student_attendance" ("id" SERIAL NOT NULL, "date" date NOT NULL, "status" "public"."student_attendance_status_enum" NOT NULL DEFAULT 'present', "remarks" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "studentId" integer, "sectionId" integer, CONSTRAINT "PK_432904873d2981c3443763ef49d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fd9196ae85b5cc05b313e5ba10" ON "student_attendance" ("date") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2b9520face75aceadd7d17f739" ON "student_attendance" ("studentId", "date") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."student_leave_request_status_enum" AS ENUM('pending', 'approved', 'rejected', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "student_leave_request" ("id" SERIAL NOT NULL, "fromDate" date NOT NULL, "toDate" date NOT NULL, "reason" text NOT NULL, "status" "public"."student_leave_request_status_enum" NOT NULL DEFAULT 'pending', "adminRemarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "studentId" integer, "approvedById" integer, CONSTRAINT "PK_5eccf993da76bb4889bf6a6fc68" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."fee_structure_frequency_enum" AS ENUM('one_time', 'monthly', 'quarterly', 'semi_annual', 'annual')`,
    );
    await queryRunner.query(
      `CREATE TABLE "fee_structure" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "amount" numeric(12,2) NOT NULL, "frequency" "public"."fee_structure_frequency_enum" NOT NULL DEFAULT 'monthly', "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "institutionId" integer, "gradeClassId" integer, "academicYearId" integer, CONSTRAINT "PK_a32d707ce58ab84c493b492cfc5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4759dd5e5d3411630f3f834f64" ON "fee_structure" ("institutionId", "gradeClassId", "academicYearId", "name") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."fee_payment_method_enum" AS ENUM('cash', 'bank_transfer', 'cheque', 'online', 'card')`,
    );
    await queryRunner.query(
      `CREATE TABLE "fee_payment" ("id" SERIAL NOT NULL, "amount" numeric(12,2) NOT NULL, "method" "public"."fee_payment_method_enum" NOT NULL DEFAULT 'cash', "transactionRef" character varying, "receiptNumber" character varying, "paidAt" TIMESTAMP, "remarks" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "feeChallanId" integer, CONSTRAINT "PK_04a477e9910932c09e80e282d36" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."fee_challan_status_enum" AS ENUM('pending', 'partial', 'paid', 'overdue', 'waived', 'refunded')`,
    );
    await queryRunner.query(
      `CREATE TABLE "fee_challan" ("id" SERIAL NOT NULL, "challanNumber" character varying NOT NULL, "totalAmount" numeric(12,2) NOT NULL, "paidAmount" numeric(12,2) NOT NULL DEFAULT '0', "discount" numeric(12,2) NOT NULL DEFAULT '0', "dueDate" date NOT NULL, "issueDate" date, "status" "public"."fee_challan_status_enum" NOT NULL DEFAULT 'pending', "remarks" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "studentId" integer, "feeStructureId" integer, CONSTRAINT "UQ_82bf37f713f37eb09947017c583" UNIQUE ("challanNumber"), CONSTRAINT "PK_086323eb60f02e6ea635dd1c333" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_82bf37f713f37eb09947017c58" ON "fee_challan" ("challanNumber") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_14ae779f6e27815788a549f0d7" ON "fee_challan" ("dueDate") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."exam_type_enum" AS ENUM('class_test', 'midterm', 'final', 'quiz', 'practical', 'assignment')`,
    );
    await queryRunner.query(
      `CREATE TABLE "exam" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" "public"."exam_type_enum" NOT NULL DEFAULT 'midterm', "startDate" date NOT NULL, "endDate" date NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "termId" integer, CONSTRAINT "PK_56071ab3a94aeac01f1b5ab74aa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8574883408e98577237b7ff9cc" ON "exam" ("startDate") `,
    );
    await queryRunner.query(
      `CREATE TABLE "exam_subject" ("id" SERIAL NOT NULL, "examDate" date, "totalMarks" numeric(6,2) NOT NULL, "passingMarks" numeric(6,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "examId" integer, "subjectId" integer, CONSTRAINT "PK_14c2f71a4dd7823c96d39b13757" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a0b1059dad8e07eb4db25a3f00" ON "exam_subject" ("examId", "subjectId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "exam_result" ("id" SERIAL NOT NULL, "marksObtained" numeric(6,2), "grade" character varying, "isAbsent" boolean NOT NULL DEFAULT false, "remarks" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "examSubjectId" integer, "studentId" integer, CONSTRAINT "PK_9c05af0457cef1ec4ee5f074df7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_838c4a531064facf132962202e" ON "exam_result" ("examSubjectId", "studentId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."student_gender_enum" AS ENUM('male', 'female', 'other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."student_bloodgroup_enum" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')`,
    );
    await queryRunner.query(
      `CREATE TABLE "student" ("id" SERIAL NOT NULL, "rollNumber" character varying NOT NULL, "dateOfBirth" date, "gender" "public"."student_gender_enum", "guardianName" character varying, "guardianPhone" character varying, "guardianEmail" character varying, "guardianRelation" character varying, "address" text, "city" character varying, "bloodGroup" "public"."student_bloodgroup_enum", "nationality" character varying, "religion" character varying, "admissionDate" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, "institutionId" integer, CONSTRAINT "UQ_b9a599f176274d2cd1fe147653a" UNIQUE ("rollNumber"), CONSTRAINT "REL_b35463776b4a11a3df3c30d920" UNIQUE ("userId"), CONSTRAINT "PK_3d8016e1cb58429474a3c041904" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b9a599f176274d2cd1fe147653" ON "student" ("rollNumber") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."student_enrollment_status_enum" AS ENUM('active', 'promoted', 'transferred', 'graduated', 'dropped', 'suspended')`,
    );
    await queryRunner.query(
      `CREATE TABLE "student_enrollment" ("id" SERIAL NOT NULL, "status" "public"."student_enrollment_status_enum" NOT NULL DEFAULT 'active', "enrollmentDate" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "studentId" integer, "sectionId" integer, "academicYearId" integer, CONSTRAINT "PK_8d2ebd470040ec79545843248c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_37faeaf36e0bbaa2adf72ffb8b" ON "student_enrollment" ("studentId", "academicYearId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."course_material_type_enum" AS ENUM('document', 'video', 'assignment', 'link', 'presentation')`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_material" ("id" SERIAL NOT NULL, "uploadedById" integer, "title" character varying NOT NULL, "description" text, "type" "public"."course_material_type_enum" NOT NULL DEFAULT 'document', "externalUrl" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "subjectId" integer, "fileId" uuid, CONSTRAINT "PK_f613a59407b9d91a2daccc0a636" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."admission_enquiry_status_enum" AS ENUM('new', 'contacted', 'scheduled_visit', 'visit_done', 'applied', 'accepted', 'enrolled', 'rejected', 'withdrawn')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."admission_enquiry_source_enum" AS ENUM('walk_in', 'phone', 'website', 'referral', 'social_media', 'advertisement', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "admission_enquiry" ("id" SERIAL NOT NULL, "studentName" character varying NOT NULL, "guardianName" character varying, "phone" character varying, "email" character varying, "previousSchool" character varying, "gradeApplyingFor" character varying, "status" "public"."admission_enquiry_status_enum" NOT NULL DEFAULT 'new', "source" "public"."admission_enquiry_source_enum" NOT NULL DEFAULT 'walk_in', "notes" text, "followUpDate" date, "convertedStudentId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "institutionId" integer, CONSTRAINT "PK_60aa494b9e97dfe19d5f8a530ef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cfd08f9791ede5447efd482496" ON "admission_enquiry" ("studentName") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3e151e862db3ac9c616d3d2093" ON "admission_enquiry" ("phone") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ecdb67765a3f955bc7d03ef90c" ON "admission_enquiry" ("email") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."staff_attendance_status_enum" AS ENUM('present', 'absent', 'late', 'half_day', 'excused')`,
    );
    await queryRunner.query(
      `CREATE TABLE "staff_attendance" ("id" SERIAL NOT NULL, "date" date NOT NULL, "status" "public"."staff_attendance_status_enum" NOT NULL DEFAULT 'present', "checkIn" TIME, "checkOut" TIME, "remarks" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "staffId" integer, CONSTRAINT "PK_b76740885e2e06ab5e81ccd7781" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f70974dd8f7429a838d3e1c15e" ON "staff_attendance" ("date") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f0f5b459e3823b7ac9bfe66691" ON "staff_attendance" ("staffId", "date") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."staff_leave_leavetype_enum" AS ENUM('sick', 'casual', 'earned', 'maternity', 'paternity', 'unpaid', 'other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."staff_leave_status_enum" AS ENUM('pending', 'approved', 'rejected', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "staff_leave" ("id" SERIAL NOT NULL, "fromDate" date NOT NULL, "toDate" date NOT NULL, "leaveType" "public"."staff_leave_leavetype_enum" NOT NULL DEFAULT 'casual', "reason" text NOT NULL, "status" "public"."staff_leave_status_enum" NOT NULL DEFAULT 'pending', "adminRemarks" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "staffId" integer, "approvedById" integer, CONSTRAINT "PK_b3b6053b71902d2da2594c393bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."salary_slip_status_enum" AS ENUM('draft', 'processed', 'paid', 'held')`,
    );
    await queryRunner.query(
      `CREATE TABLE "salary_slip" ("id" SERIAL NOT NULL, "month" integer NOT NULL, "year" integer NOT NULL, "basicSalary" numeric(12,2) NOT NULL, "allowances" numeric(12,2) NOT NULL DEFAULT '0', "deductions" numeric(12,2) NOT NULL DEFAULT '0', "netSalary" numeric(12,2) NOT NULL, "workingDays" integer NOT NULL DEFAULT '0', "presentDays" integer NOT NULL DEFAULT '0', "status" "public"."salary_slip_status_enum" NOT NULL DEFAULT 'draft', "paidAt" TIMESTAMP, "remarks" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "staffId" integer, CONSTRAINT "PK_1e571435c6728b0ca8e120b2d43" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f236c7e15a285141350c7d16b2" ON "salary_slip" ("staffId", "month", "year") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."staff_employmenttype_enum" AS ENUM('full_time', 'part_time', 'contract', 'visiting')`,
    );
    await queryRunner.query(
      `CREATE TABLE "staff" ("id" SERIAL NOT NULL, "employeeId" character varying NOT NULL, "designation" character varying, "qualification" character varying, "specialization" text, "experienceYears" integer, "joiningDate" date, "basicSalary" numeric(12,2) NOT NULL DEFAULT '0', "employmentType" "public"."staff_employmenttype_enum" NOT NULL DEFAULT 'full_time', "emergencyContact" character varying, "address" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, "institutionId" integer, "departmentId" integer, CONSTRAINT "UQ_cd00d607d9e3d3a6508c5c18575" UNIQUE ("employeeId"), CONSTRAINT "REL_eba76c23bcfc9dad2479b7fd2a" UNIQUE ("userId"), CONSTRAINT "PK_e4ee98bb552756c180aec1e854a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cd00d607d9e3d3a6508c5c1857" ON "staff" ("employeeId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."timetable_slot_dayofweek_enum" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')`,
    );
    await queryRunner.query(
      `CREATE TABLE "timetable_slot" ("id" SERIAL NOT NULL, "dayOfWeek" "public"."timetable_slot_dayofweek_enum" NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "room" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "sectionId" integer, "subjectId" integer, "staffId" integer, CONSTRAINT "PK_2fa0559bb204b0848e72f9477b2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_89ef4d599292906ef94e761d90" ON "timetable_slot" ("sectionId", "dayOfWeek", "startTime") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notice_targetaudience_enum" AS ENUM('all', 'students', 'staff', 'parents')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notice" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "targetAudience" "public"."notice_targetaudience_enum" NOT NULL DEFAULT 'all', "isPublished" boolean NOT NULL DEFAULT false, "publishDate" date, "expiryDate" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "institutionId" integer, "publishedById" integer, CONSTRAINT "PK_705062b14410ff1a04998f86d72" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_74c73beb0929f4b3dd1c416593" ON "notice" ("title") `,
    );
    await queryRunner.query(
      `CREATE TABLE "income" ("id" SERIAL NOT NULL, "category" character varying NOT NULL, "description" character varying, "amount" numeric(12,2) NOT NULL, "date" date NOT NULL, "referenceNumber" character varying, "receivedFrom" character varying, "remarks" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "institutionId" integer, "feePaymentId" integer, CONSTRAINT "PK_29a10f17b97568f70cee8586d58" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7f8cb6a2d61e02153071a75b96" ON "income" ("category") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f47eec29fbef2d34b93095d5c" ON "income" ("date") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."expense_status_enum" AS ENUM('pending', 'approved', 'paid', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "expense" ("id" SERIAL NOT NULL, "category" character varying NOT NULL, "description" character varying, "amount" numeric(12,2) NOT NULL, "date" date NOT NULL, "referenceNumber" character varying, "paidTo" character varying, "status" "public"."expense_status_enum" NOT NULL DEFAULT 'pending', "remarks" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "institutionId" integer, "salarySlipId" integer, CONSTRAINT "PK_edd925b450e13ea36197c9590fc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3005f26af8a717b9a2c5b8111c" ON "expense" ("category") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_74afce11886f545980dde124d5" ON "expense" ("date") `,
    );
    await queryRunner.query(
      `ALTER TABLE "term" ADD CONSTRAINT "FK_154b6a16a7016fb3362824cbcd1" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "academic_year" ADD CONSTRAINT "FK_39fefb720e7d56d7aacd1fbd103" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subject" ADD CONSTRAINT "FK_31e43ac2a7451ee88ed17da939c" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "department" ADD CONSTRAINT "FK_859431b1a80bf1db8c21805e4a5" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "section" ADD CONSTRAINT "FK_68dab076f0d1b1781ce37150a76" FOREIGN KEY ("gradeClassId") REFERENCES "grade_class"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "grade_class" ADD CONSTRAINT "FK_214c2afa16bcae8068aed826995" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_document" ADD CONSTRAINT "FK_b959bdeb75ea9f629bcce22f3e6" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_document" ADD CONSTRAINT "FK_529a4dff55b562d48a862eb403b" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_attendance" ADD CONSTRAINT "FK_37db95ccd34d2f592c76006ff7f" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_attendance" ADD CONSTRAINT "FK_f467b86153bf6d6d1bd77e3f7fc" FOREIGN KEY ("sectionId") REFERENCES "section"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_leave_request" ADD CONSTRAINT "FK_25b7e49a47059e522d221f56977" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_leave_request" ADD CONSTRAINT "FK_6834fddaaf5640aee73eb206d24" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_structure" ADD CONSTRAINT "FK_753d62b6c21580bb863b95cfa11" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_structure" ADD CONSTRAINT "FK_b626fd68ae1f540fc53c8a83f9c" FOREIGN KEY ("gradeClassId") REFERENCES "grade_class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_structure" ADD CONSTRAINT "FK_2172845ae8f7dda34557ceab118" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_payment" ADD CONSTRAINT "FK_f440ae4cbd5ea132718bad0bd3b" FOREIGN KEY ("feeChallanId") REFERENCES "fee_challan"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_challan" ADD CONSTRAINT "FK_c7ddc06a0348aa5df2a1f48f723" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_challan" ADD CONSTRAINT "FK_8605198a1c1261ff5fb637f04ee" FOREIGN KEY ("feeStructureId") REFERENCES "fee_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "exam" ADD CONSTRAINT "FK_698a93e04b114355176908d35fd" FOREIGN KEY ("termId") REFERENCES "term"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "exam_subject" ADD CONSTRAINT "FK_e45698f0729a8afd5a66b22154b" FOREIGN KEY ("examId") REFERENCES "exam"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "exam_subject" ADD CONSTRAINT "FK_e27267f7d63a0ac680fc1f87f75" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "exam_result" ADD CONSTRAINT "FK_14a00b005e98fda6f72d90e84c8" FOREIGN KEY ("examSubjectId") REFERENCES "exam_subject"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "exam_result" ADD CONSTRAINT "FK_f831a5328ee0cb271a58640c482" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ADD CONSTRAINT "FK_b35463776b4a11a3df3c30d920a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" ADD CONSTRAINT "FK_1829558ab114be65a7aa1dc950b" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_enrollment" ADD CONSTRAINT "FK_8c0d7ae2fa742a72d91ffdf0ca0" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_enrollment" ADD CONSTRAINT "FK_279b2eac97dbf170f67c5e0e8f5" FOREIGN KEY ("sectionId") REFERENCES "section"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_enrollment" ADD CONSTRAINT "FK_02670622aeba410da2cc4723759" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_material" ADD CONSTRAINT "FK_aff94d2c6ff6f185c6696472a0c" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_material" ADD CONSTRAINT "FK_21af4ae78a860a106a663551fa3" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "admission_enquiry" ADD CONSTRAINT "FK_873843cb084319ec2289d891402" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_attendance" ADD CONSTRAINT "FK_0aed7c22a4e2c4b6fe6127af2f1" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_leave" ADD CONSTRAINT "FK_b9e87ddb6975330ee49f64b49b7" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_leave" ADD CONSTRAINT "FK_f3b155eced44dbab879196a7471" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_slip" ADD CONSTRAINT "FK_700d98e0a68a32faac987783a64" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff" ADD CONSTRAINT "FK_eba76c23bcfc9dad2479b7fd2ad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff" ADD CONSTRAINT "FK_44d84566f426b59c045fb714a2f" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff" ADD CONSTRAINT "FK_67b6b543fe99f3accd85374f886" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetable_slot" ADD CONSTRAINT "FK_52b9d1a013406aa85ff289287b0" FOREIGN KEY ("sectionId") REFERENCES "section"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetable_slot" ADD CONSTRAINT "FK_1f121463854969a9c059768fadc" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetable_slot" ADD CONSTRAINT "FK_91ab69ff1bc004820daee802bc9" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notice" ADD CONSTRAINT "FK_26802a7d12b4ed652ad9d061df6" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notice" ADD CONSTRAINT "FK_f8997409ffcce95ac300d040c1f" FOREIGN KEY ("publishedById") REFERENCES "staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "income" ADD CONSTRAINT "FK_7617ea556e5e4abdffb24e15812" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "income" ADD CONSTRAINT "FK_b830418f91f35444014eff1451b" FOREIGN KEY ("feePaymentId") REFERENCES "fee_payment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense" ADD CONSTRAINT "FK_ec3831b019e58ef5fa9b1af6e7f" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense" ADD CONSTRAINT "FK_ac213ac1a343fe9cdc691584317" FOREIGN KEY ("salarySlipId") REFERENCES "salary_slip"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expense" DROP CONSTRAINT "FK_ac213ac1a343fe9cdc691584317"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense" DROP CONSTRAINT "FK_ec3831b019e58ef5fa9b1af6e7f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "income" DROP CONSTRAINT "FK_b830418f91f35444014eff1451b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "income" DROP CONSTRAINT "FK_7617ea556e5e4abdffb24e15812"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notice" DROP CONSTRAINT "FK_f8997409ffcce95ac300d040c1f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notice" DROP CONSTRAINT "FK_26802a7d12b4ed652ad9d061df6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetable_slot" DROP CONSTRAINT "FK_91ab69ff1bc004820daee802bc9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetable_slot" DROP CONSTRAINT "FK_1f121463854969a9c059768fadc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetable_slot" DROP CONSTRAINT "FK_52b9d1a013406aa85ff289287b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff" DROP CONSTRAINT "FK_67b6b543fe99f3accd85374f886"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff" DROP CONSTRAINT "FK_44d84566f426b59c045fb714a2f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff" DROP CONSTRAINT "FK_eba76c23bcfc9dad2479b7fd2ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_slip" DROP CONSTRAINT "FK_700d98e0a68a32faac987783a64"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_leave" DROP CONSTRAINT "FK_f3b155eced44dbab879196a7471"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_leave" DROP CONSTRAINT "FK_b9e87ddb6975330ee49f64b49b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_attendance" DROP CONSTRAINT "FK_0aed7c22a4e2c4b6fe6127af2f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admission_enquiry" DROP CONSTRAINT "FK_873843cb084319ec2289d891402"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_material" DROP CONSTRAINT "FK_21af4ae78a860a106a663551fa3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_material" DROP CONSTRAINT "FK_aff94d2c6ff6f185c6696472a0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_enrollment" DROP CONSTRAINT "FK_02670622aeba410da2cc4723759"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_enrollment" DROP CONSTRAINT "FK_279b2eac97dbf170f67c5e0e8f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_enrollment" DROP CONSTRAINT "FK_8c0d7ae2fa742a72d91ffdf0ca0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" DROP CONSTRAINT "FK_1829558ab114be65a7aa1dc950b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" DROP CONSTRAINT "FK_b35463776b4a11a3df3c30d920a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exam_result" DROP CONSTRAINT "FK_f831a5328ee0cb271a58640c482"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exam_result" DROP CONSTRAINT "FK_14a00b005e98fda6f72d90e84c8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exam_subject" DROP CONSTRAINT "FK_e27267f7d63a0ac680fc1f87f75"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exam_subject" DROP CONSTRAINT "FK_e45698f0729a8afd5a66b22154b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exam" DROP CONSTRAINT "FK_698a93e04b114355176908d35fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_challan" DROP CONSTRAINT "FK_8605198a1c1261ff5fb637f04ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_challan" DROP CONSTRAINT "FK_c7ddc06a0348aa5df2a1f48f723"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_payment" DROP CONSTRAINT "FK_f440ae4cbd5ea132718bad0bd3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_structure" DROP CONSTRAINT "FK_2172845ae8f7dda34557ceab118"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_structure" DROP CONSTRAINT "FK_b626fd68ae1f540fc53c8a83f9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_structure" DROP CONSTRAINT "FK_753d62b6c21580bb863b95cfa11"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_leave_request" DROP CONSTRAINT "FK_6834fddaaf5640aee73eb206d24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_leave_request" DROP CONSTRAINT "FK_25b7e49a47059e522d221f56977"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_attendance" DROP CONSTRAINT "FK_f467b86153bf6d6d1bd77e3f7fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_attendance" DROP CONSTRAINT "FK_37db95ccd34d2f592c76006ff7f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_document" DROP CONSTRAINT "FK_529a4dff55b562d48a862eb403b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_document" DROP CONSTRAINT "FK_b959bdeb75ea9f629bcce22f3e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grade_class" DROP CONSTRAINT "FK_214c2afa16bcae8068aed826995"`,
    );
    await queryRunner.query(
      `ALTER TABLE "section" DROP CONSTRAINT "FK_68dab076f0d1b1781ce37150a76"`,
    );
    await queryRunner.query(
      `ALTER TABLE "department" DROP CONSTRAINT "FK_859431b1a80bf1db8c21805e4a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subject" DROP CONSTRAINT "FK_31e43ac2a7451ee88ed17da939c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "academic_year" DROP CONSTRAINT "FK_39fefb720e7d56d7aacd1fbd103"`,
    );
    await queryRunner.query(
      `ALTER TABLE "term" DROP CONSTRAINT "FK_154b6a16a7016fb3362824cbcd1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_74afce11886f545980dde124d5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3005f26af8a717b9a2c5b8111c"`,
    );
    await queryRunner.query(`DROP TABLE "expense"`);
    await queryRunner.query(`DROP TYPE "public"."expense_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f47eec29fbef2d34b93095d5c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7f8cb6a2d61e02153071a75b96"`,
    );
    await queryRunner.query(`DROP TABLE "income"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_74c73beb0929f4b3dd1c416593"`,
    );
    await queryRunner.query(`DROP TABLE "notice"`);
    await queryRunner.query(`DROP TYPE "public"."notice_targetaudience_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_89ef4d599292906ef94e761d90"`,
    );
    await queryRunner.query(`DROP TABLE "timetable_slot"`);
    await queryRunner.query(
      `DROP TYPE "public"."timetable_slot_dayofweek_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cd00d607d9e3d3a6508c5c1857"`,
    );
    await queryRunner.query(`DROP TABLE "staff"`);
    await queryRunner.query(`DROP TYPE "public"."staff_employmenttype_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f236c7e15a285141350c7d16b2"`,
    );
    await queryRunner.query(`DROP TABLE "salary_slip"`);
    await queryRunner.query(`DROP TYPE "public"."salary_slip_status_enum"`);
    await queryRunner.query(`DROP TABLE "staff_leave"`);
    await queryRunner.query(`DROP TYPE "public"."staff_leave_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."staff_leave_leavetype_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f0f5b459e3823b7ac9bfe66691"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f70974dd8f7429a838d3e1c15e"`,
    );
    await queryRunner.query(`DROP TABLE "staff_attendance"`);
    await queryRunner.query(
      `DROP TYPE "public"."staff_attendance_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ecdb67765a3f955bc7d03ef90c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3e151e862db3ac9c616d3d2093"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cfd08f9791ede5447efd482496"`,
    );
    await queryRunner.query(`DROP TABLE "admission_enquiry"`);
    await queryRunner.query(
      `DROP TYPE "public"."admission_enquiry_source_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."admission_enquiry_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "course_material"`);
    await queryRunner.query(`DROP TYPE "public"."course_material_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_37faeaf36e0bbaa2adf72ffb8b"`,
    );
    await queryRunner.query(`DROP TABLE "student_enrollment"`);
    await queryRunner.query(
      `DROP TYPE "public"."student_enrollment_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b9a599f176274d2cd1fe147653"`,
    );
    await queryRunner.query(`DROP TABLE "student"`);
    await queryRunner.query(`DROP TYPE "public"."student_bloodgroup_enum"`);
    await queryRunner.query(`DROP TYPE "public"."student_gender_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_838c4a531064facf132962202e"`,
    );
    await queryRunner.query(`DROP TABLE "exam_result"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a0b1059dad8e07eb4db25a3f00"`,
    );
    await queryRunner.query(`DROP TABLE "exam_subject"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8574883408e98577237b7ff9cc"`,
    );
    await queryRunner.query(`DROP TABLE "exam"`);
    await queryRunner.query(`DROP TYPE "public"."exam_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_14ae779f6e27815788a549f0d7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_82bf37f713f37eb09947017c58"`,
    );
    await queryRunner.query(`DROP TABLE "fee_challan"`);
    await queryRunner.query(`DROP TYPE "public"."fee_challan_status_enum"`);
    await queryRunner.query(`DROP TABLE "fee_payment"`);
    await queryRunner.query(`DROP TYPE "public"."fee_payment_method_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4759dd5e5d3411630f3f834f64"`,
    );
    await queryRunner.query(`DROP TABLE "fee_structure"`);
    await queryRunner.query(
      `DROP TYPE "public"."fee_structure_frequency_enum"`,
    );
    await queryRunner.query(`DROP TABLE "student_leave_request"`);
    await queryRunner.query(
      `DROP TYPE "public"."student_leave_request_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2b9520face75aceadd7d17f739"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fd9196ae85b5cc05b313e5ba10"`,
    );
    await queryRunner.query(`DROP TABLE "student_attendance"`);
    await queryRunner.query(
      `DROP TYPE "public"."student_attendance_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "student_document"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_505d00ce02e2c67d3e0df4c72f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d218ad3566afa9e396f184fd7d"`,
    );
    await queryRunner.query(`DROP TABLE "institution"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7af2ae6aa0953928fb87600fb9"`,
    );
    await queryRunner.query(`DROP TABLE "grade_class"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfe1bef5be8b341b3c134c2306"`,
    );
    await queryRunner.query(`DROP TABLE "section"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bcb15da75a092d57f656b96fbe"`,
    );
    await queryRunner.query(`DROP TABLE "department"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_542c3a24d2c56cfeabfaff7c21"`,
    );
    await queryRunner.query(`DROP TABLE "subject"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2ee52964ade76cfd35de4e5f48"`,
    );
    await queryRunner.query(`DROP TABLE "academic_year"`);
    await queryRunner.query(`DROP TABLE "term"`);
  }
}
