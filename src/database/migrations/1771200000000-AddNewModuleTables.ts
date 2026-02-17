import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewModuleTables1771200000000 implements MigrationInterface {
  name = 'AddNewModuleTables1771200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── Create enum types ──────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_type_enum') THEN
          CREATE TYPE "employment_type_enum" AS ENUM ('full_time', 'part_time', 'contract', 'visiting');
        END IF;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status_enum') THEN
          CREATE TYPE "attendance_status_enum" AS ENUM ('present', 'absent', 'late', 'half_day', 'excused');
        END IF;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leave_status_enum') THEN
          CREATE TYPE "leave_status_enum" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
        END IF;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leave_type_enum') THEN
          CREATE TYPE "leave_type_enum" AS ENUM ('sick', 'casual', 'earned', 'maternity', 'paternity', 'unpaid', 'other');
        END IF;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_material_type_enum') THEN
          CREATE TYPE "course_material_type_enum" AS ENUM ('document', 'video', 'assignment', 'link', 'presentation');
        END IF;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'concession_type_enum') THEN
          CREATE TYPE "concession_type_enum" AS ENUM ('scholarship', 'sibling', 'staff_child', 'merit', 'financial_aid');
        END IF;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'salary_status_enum') THEN
          CREATE TYPE "salary_status_enum" AS ENUM ('draft', 'processed', 'paid', 'held');
        END IF;
      END $$
    `);

    // ─── 1. student_guardian ────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "student_guardian" (
        "id" SERIAL NOT NULL,
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "name" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "email" character varying,
        "relation" character varying NOT NULL,
        "isPrimary" boolean NOT NULL DEFAULT false,
        "studentId" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_student_guardian" PRIMARY KEY ("id"),
        CONSTRAINT "FK_student_guardian_student" FOREIGN KEY ("studentId")
          REFERENCES "student"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_student_guardian_tenantId" ON "student_guardian" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_student_guardian_branchId" ON "student_guardian" ("branchId")`,
    );

    // ─── 2. staff_mgmt ─────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "staff_mgmt" (
        "id" SERIAL NOT NULL,
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "userId" integer,
        "institutionId" integer,
        "departmentId" integer,
        "staffId" character varying NOT NULL,
        "primaryBranchId" uuid NOT NULL,
        "designation" character varying,
        "qualification" character varying,
        "specialization" text,
        "experienceYears" integer,
        "joiningDate" date,
        "basicSalary" numeric(12,2) NOT NULL DEFAULT 0,
        "employmentType" "employment_type_enum" NOT NULL DEFAULT 'full_time',
        "emergencyContact" character varying,
        "address" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_staff_mgmt" PRIMARY KEY ("id"),
        CONSTRAINT "FK_staff_mgmt_user" FOREIGN KEY ("userId")
          REFERENCES "user"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_staff_mgmt_institution" FOREIGN KEY ("institutionId")
          REFERENCES "institution"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_staff_mgmt_department" FOREIGN KEY ("departmentId")
          REFERENCES "department"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_mgmt_tenantId" ON "staff_mgmt" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_mgmt_branchId" ON "staff_mgmt" ("branchId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_mgmt_staffId" ON "staff_mgmt" ("staffId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_staff_mgmt_tenant_staffId" ON "staff_mgmt" ("tenantId", "staffId")`,
    );

    // ─── 3. staff_branch_assignment ─────────────────────────
    await queryRunner.query(`
      CREATE TABLE "staff_branch_assignment" (
        "id" SERIAL NOT NULL,
        "tenantId" uuid NOT NULL,
        "staffEntityId" integer NOT NULL,
        "branchId" uuid NOT NULL,
        "roles" text NOT NULL DEFAULT '',
        "isPrimary" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_staff_branch_assignment" PRIMARY KEY ("id"),
        CONSTRAINT "FK_staff_branch_assignment_staff" FOREIGN KEY ("staffEntityId")
          REFERENCES "staff_mgmt"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_branch_assignment_tenantId" ON "staff_branch_assignment" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_branch_assignment_branchId" ON "staff_branch_assignment" ("branchId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_staff_branch_assignment_unique" ON "staff_branch_assignment" ("tenantId", "staffEntityId", "branchId")`,
    );

    // ─── 4. staff_attendance_record ─────────────────────────
    await queryRunner.query(`
      CREATE TABLE "staff_attendance_record" (
        "id" SERIAL NOT NULL,
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "staffId" integer NOT NULL,
        "date" date NOT NULL,
        "status" "attendance_status_enum" NOT NULL DEFAULT 'present',
        "checkInTime" TIMESTAMP NOT NULL,
        "checkOutTime" TIMESTAMP,
        "remarks" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_staff_attendance_record" PRIMARY KEY ("id"),
        CONSTRAINT "FK_staff_attendance_record_staff" FOREIGN KEY ("staffId")
          REFERENCES "staff_mgmt"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_attendance_record_tenantId" ON "staff_attendance_record" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_attendance_record_branchId" ON "staff_attendance_record" ("branchId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_attendance_record_staffId" ON "staff_attendance_record" ("staffId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_attendance_record_date" ON "staff_attendance_record" ("date")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_staff_attendance_record_unique" ON "staff_attendance_record" ("tenantId", "staffId", "date")`,
    );

    // ─── 5. staff_leave_application ─────────────────────────
    await queryRunner.query(`
      CREATE TABLE "staff_leave_application" (
        "id" SERIAL NOT NULL,
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "staffId" integer NOT NULL,
        "fromDate" date NOT NULL,
        "toDate" date NOT NULL,
        "leaveType" "leave_type_enum" NOT NULL DEFAULT 'casual',
        "reason" text NOT NULL,
        "status" "leave_status_enum" NOT NULL DEFAULT 'pending',
        "approvedById" integer,
        "adminRemarks" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_staff_leave_application" PRIMARY KEY ("id"),
        CONSTRAINT "FK_staff_leave_application_staff" FOREIGN KEY ("staffId")
          REFERENCES "staff_mgmt"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_staff_leave_application_approvedBy" FOREIGN KEY ("approvedById")
          REFERENCES "user"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_leave_application_tenantId" ON "staff_leave_application" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_leave_application_branchId" ON "staff_leave_application" ("branchId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_leave_application_staffId" ON "staff_leave_application" ("staffId")`,
    );

    // ─── 6. staff_leave_balance ─────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "staff_leave_balance" (
        "id" SERIAL NOT NULL,
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "staffId" integer NOT NULL,
        "leaveType" "leave_type_enum" NOT NULL DEFAULT 'casual',
        "totalDays" numeric(5,2) NOT NULL DEFAULT 0,
        "usedDays" numeric(5,2) NOT NULL DEFAULT 0,
        "year" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_staff_leave_balance" PRIMARY KEY ("id"),
        CONSTRAINT "FK_staff_leave_balance_staff" FOREIGN KEY ("staffId")
          REFERENCES "staff_mgmt"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_leave_balance_tenantId" ON "staff_leave_balance" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_leave_balance_branchId" ON "staff_leave_balance" ("branchId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_leave_balance_staffId" ON "staff_leave_balance" ("staffId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_staff_leave_balance_unique" ON "staff_leave_balance" ("tenantId", "staffId", "leaveType", "year")`,
    );

    // ─── 7. grading_scale ───────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "grading_scale" (
        "id" SERIAL NOT NULL,
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "name" character varying NOT NULL UNIQUE,
        "grades" jsonb NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_grading_scale" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_grading_scale_tenantId" ON "grading_scale" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_grading_scale_branchId" ON "grading_scale" ("branchId")`,
    );

    // ─── 8. fee_concession ──────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "fee_concession" (
        "id" SERIAL NOT NULL,
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "studentId" integer,
        "type" "concession_type_enum" NOT NULL,
        "discountPercentage" numeric(5,2) NOT NULL,
        "validFrom" date NOT NULL,
        "validTo" date NOT NULL,
        "reason" character varying,
        "approved" boolean NOT NULL DEFAULT false,
        "approvedBy" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_fee_concession" PRIMARY KEY ("id"),
        CONSTRAINT "FK_fee_concession_student" FOREIGN KEY ("studentId")
          REFERENCES "student"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_fee_concession_tenantId" ON "fee_concession" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fee_concession_branchId" ON "fee_concession" ("branchId")`,
    );

    // ─── 9. fee_receipt ─────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "fee_receipt" (
        "id" SERIAL NOT NULL,
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "paymentId" integer,
        "receiptNumber" character varying NOT NULL UNIQUE,
        "amount" numeric(12,2) NOT NULL,
        "studentName" character varying,
        "challanNumber" character varying,
        "paymentMethod" character varying,
        "issuedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_fee_receipt" PRIMARY KEY ("id"),
        CONSTRAINT "FK_fee_receipt_payment" FOREIGN KEY ("paymentId")
          REFERENCES "fee_payment"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_fee_receipt_tenantId" ON "fee_receipt" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fee_receipt_branchId" ON "fee_receipt" ("branchId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fee_receipt_receiptNumber" ON "fee_receipt" ("receiptNumber")`,
    );

    // ─── 10. material ───────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "material" (
        "id" SERIAL NOT NULL,
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "subjectId" integer NOT NULL,
        "uploadedById" integer,
        "title" character varying NOT NULL,
        "description" text,
        "type" "course_material_type_enum" NOT NULL DEFAULT 'document',
        "filePath" character varying,
        "fileSize" bigint NOT NULL DEFAULT 0,
        "externalUrl" character varying,
        "version" integer NOT NULL DEFAULT 1,
        "downloadCount" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_material" PRIMARY KEY ("id"),
        CONSTRAINT "FK_material_subject" FOREIGN KEY ("subjectId")
          REFERENCES "subject"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_material_tenantId" ON "material" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_material_branchId" ON "material" ("branchId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_material_tenant_subject" ON "material" ("tenantId", "subjectId")`,
    );

    // ─── 11. assignment ─────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "assignment" (
        "id" SERIAL NOT NULL,
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "subjectId" integer NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "dueDate" TIMESTAMP NOT NULL,
        "totalMarks" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_assignment" PRIMARY KEY ("id"),
        CONSTRAINT "FK_assignment_subject" FOREIGN KEY ("subjectId")
          REFERENCES "subject"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_assignment_tenantId" ON "assignment" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_assignment_branchId" ON "assignment" ("branchId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_assignment_tenant_subject" ON "assignment" ("tenantId", "subjectId")`,
    );

    // ─── 12. assignment_submission ──────────────────────────
    await queryRunner.query(`
      CREATE TABLE "assignment_submission" (
        "id" SERIAL NOT NULL,
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "assignmentId" integer NOT NULL,
        "studentId" integer NOT NULL,
        "filePath" character varying,
        "fileSize" bigint NOT NULL DEFAULT 0,
        "remarks" text,
        "marks" integer,
        "submittedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_assignment_submission" PRIMARY KEY ("id"),
        CONSTRAINT "FK_assignment_submission_assignment" FOREIGN KEY ("assignmentId")
          REFERENCES "assignment"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_assignment_submission_tenantId" ON "assignment_submission" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_assignment_submission_branchId" ON "assignment_submission" ("branchId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_assignment_submission_tenant_assignment" ON "assignment_submission" ("tenantId", "assignmentId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_assignment_submission_tenant_student" ON "assignment_submission" ("tenantId", "studentId")`,
    );

    // ─── 13. download_record ────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "download_record" (
        "id" SERIAL NOT NULL,
        "tenantId" uuid NOT NULL,
        "materialId" integer NOT NULL,
        "userId" integer NOT NULL,
        "downloadedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_download_record" PRIMARY KEY ("id"),
        CONSTRAINT "FK_download_record_material" FOREIGN KEY ("materialId")
          REFERENCES "material"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_download_record_tenantId" ON "download_record" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_download_record_tenant_material" ON "download_record" ("tenantId", "materialId")`,
    );

    // ─── 14. salary_structure ───────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "salary_structure" (
        "id" SERIAL NOT NULL,
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "staffId" integer NOT NULL,
        "name" character varying NOT NULL,
        "components" jsonb NOT NULL,
        "totalEarnings" numeric(12,2) NOT NULL DEFAULT 0,
        "totalDeductions" numeric(12,2) NOT NULL DEFAULT 0,
        "netPay" numeric(12,2) NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_salary_structure" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_salary_structure_tenantId" ON "salary_structure" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_salary_structure_branchId" ON "salary_structure" ("branchId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_salary_structure_tenant_staff" ON "salary_structure" ("tenantId", "staffId")`,
    );

    // ─── 15. payroll_slip ───────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "payroll_slip" (
        "id" SERIAL NOT NULL,
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "staffId" integer NOT NULL,
        "structureId" integer NOT NULL,
        "month" integer NOT NULL,
        "year" integer NOT NULL,
        "breakdown" jsonb NOT NULL,
        "totalEarnings" numeric(12,2) NOT NULL DEFAULT 0,
        "totalDeductions" numeric(12,2) NOT NULL DEFAULT 0,
        "netPay" numeric(12,2) NOT NULL DEFAULT 0,
        "workingDays" integer NOT NULL DEFAULT 0,
        "presentDays" integer NOT NULL DEFAULT 0,
        "status" "salary_status_enum" NOT NULL DEFAULT 'processed',
        "paidAt" TIMESTAMP,
        "remarks" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_payroll_slip" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_payroll_slip_tenantId" ON "payroll_slip" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payroll_slip_branchId" ON "payroll_slip" ("branchId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_payroll_slip_unique" ON "payroll_slip" ("tenantId", "staffId", "month", "year")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "payroll_slip"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "salary_structure"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "download_record"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "assignment_submission"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "assignment"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "material"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_receipt"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_concession"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "grading_scale"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_leave_balance"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_leave_application"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_attendance_record"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_branch_assignment"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_mgmt"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_guardian"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "salary_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "concession_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "course_material_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "leave_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "leave_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "attendance_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "employment_type_enum"`);
  }
}
