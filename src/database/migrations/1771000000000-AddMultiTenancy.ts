import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMultiTenancy1771000000000 implements MigrationInterface {
  name = 'AddMultiTenancy1771000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── 1. Create tenant table ─────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "tenant" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "contactEmail" character varying,
        "contactPhone" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "settings" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "UQ_tenant_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_tenant" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_name" ON "tenant" ("name")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_tenant_slug" ON "tenant" ("slug")
    `);

    // ─── 2. Create branch table ─────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "branch" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "code" character varying NOT NULL,
        "address" character varying,
        "city" character varying,
        "state" character varying,
        "country" character varying,
        "phone" character varying,
        "email" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "isHeadquarters" boolean NOT NULL DEFAULT false,
        "tenantId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_branch" PRIMARY KEY ("id"),
        CONSTRAINT "FK_branch_tenant" FOREIGN KEY ("tenantId")
          REFERENCES "tenant"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_branch_tenant_code" ON "branch" ("tenantId", "code")
    `);

    // ─── 3. Create tenant_user table ────────────────────────
    await queryRunner.query(`
      CREATE TABLE "tenant_user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "isActive" boolean NOT NULL DEFAULT true,
        "tenantId" uuid NOT NULL,
        "userId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_tenant_user" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tenant_user_tenant" FOREIGN KEY ("tenantId")
          REFERENCES "tenant"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tenant_user_user" FOREIGN KEY ("userId")
          REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_tenant_user_tenant_user" ON "tenant_user" ("tenantId", "userId")
    `);

    // ─── 4. Create a default tenant ────────────────────────
    await queryRunner.query(`
      INSERT INTO "tenant" ("id", "name", "slug", "isActive")
      VALUES ('00000000-0000-0000-0000-000000000001', 'Default Tenant', 'default', true)
    `);

    // ─── 5. Create a default branch ────────────────────────
    await queryRunner.query(`
      INSERT INTO "branch" ("id", "tenantId", "name", "code", "isHeadquarters")
      VALUES (
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'Main Branch', 'MAIN', true
      )
    `);

    // ─── 6. Assign existing users to default tenant ────────
    await queryRunner.query(`
      INSERT INTO "tenant_user" ("tenantId", "userId")
      SELECT '00000000-0000-0000-0000-000000000001', "id" FROM "user"
    `);

    // ─── 7. Add tenant_id and branch_id to session ─────────
    await queryRunner.query(`
      ALTER TABLE "session" ADD "tenantId" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "session" ADD "branchId" uuid
    `);
    await queryRunner.query(`
      UPDATE "session" SET "tenantId" = '00000000-0000-0000-0000-000000000001'
    `);
    await queryRunner.query(`
      ALTER TABLE "session" ALTER COLUMN "tenantId" SET NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_session_tenantId" ON "session" ("tenantId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_session_branchId" ON "session" ("branchId")
    `);

    // ─── 8. Add tenant_id and branch_id to ALL LMS tables ──
    const tables = [
      'student_guardian',
      'fee_receipt',
      'fee_concession',
      'grading_scale',
      'academic_year',
      'term',
      'institution',
      'department',
      'grade_class',
      'section',
      'subject',
      'student',
      'admission_enquiry',
      'student_enrollment',
      'student_document',
      'student_attendance',
      'student_leave_request',
      'fee_structure',
      'fee_challan',
      'fee_payment',
      'exam',
      'exam_subject',
      'exam_result',
      'course_material',
      'staff',
      'staff_attendance',
      'staff_leave',
      'salary_slip',
      'notice',
      'timetable_slot',
      'income',
      'expense',
    ];

    for (const table of tables) {
      // Check if table exists before altering
      const tableExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = '${table}'
        )
      `);
      if (!tableExists[0]?.exists) continue;

      // Add columns
      await queryRunner.query(`
        ALTER TABLE "${table}" ADD "tenantId" uuid
      `);
      await queryRunner.query(`
        ALTER TABLE "${table}" ADD "branchId" uuid
      `);

      // Set default tenant for existing data
      await queryRunner.query(`
        UPDATE "${table}" SET "tenantId" = '00000000-0000-0000-0000-000000000001'
      `);

      // Make tenantId NOT NULL
      await queryRunner.query(`
        ALTER TABLE "${table}" ALTER COLUMN "tenantId" SET NOT NULL
      `);

      // Add indexes
      await queryRunner.query(`
        CREATE INDEX "IDX_${table}_tenantId" ON "${table}" ("tenantId")
      `);
      await queryRunner.query(`
        CREATE INDEX "IDX_${table}_branchId" ON "${table}" ("branchId")
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ─── Remove tenant_id/branch_id from all LMS tables ────
    const tables = [
      'student_guardian',
      'fee_receipt',
      'fee_concession',
      'grading_scale',
      'academic_year',
      'term',
      'institution',
      'department',
      'grade_class',
      'section',
      'subject',
      'student',
      'admission_enquiry',
      'student_enrollment',
      'student_document',
      'student_attendance',
      'student_leave_request',
      'fee_structure',
      'fee_challan',
      'fee_payment',
      'exam',
      'exam_subject',
      'exam_result',
      'course_material',
      'staff',
      'staff_attendance',
      'staff_leave',
      'salary_slip',
      'notice',
      'timetable_slot',
      'income',
      'expense',
    ];

    for (const table of tables) {
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_${table}_branchId"`);
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_${table}_tenantId"`);
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "branchId"`);
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "tenantId"`);
    }

    // Remove from session
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_session_branchId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_session_tenantId"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN IF EXISTS "branchId"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN IF EXISTS "tenantId"`);

    // Drop tenant tables
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_user"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "branch"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant"`);
  }
}
