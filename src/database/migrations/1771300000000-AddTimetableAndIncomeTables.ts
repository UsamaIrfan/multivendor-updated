import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimetableAndIncomeTables1771300000000
  implements MigrationInterface
{
  name = 'AddTimetableAndIncomeTables1771300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── 1. timetables ─────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "timetables" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "classId" uuid NOT NULL,
        "academicYearId" uuid NOT NULL,
        "name" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_timetables" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_timetables_tenantId" ON "timetables" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_timetables_branchId" ON "timetables" ("branchId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_timetables_classId" ON "timetables" ("classId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_timetables_academicYearId" ON "timetables" ("academicYearId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_timetables_tenant_branch_class" ON "timetables" ("tenantId", "branchId", "classId")`,
    );

    // ─── 2. periods ────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "periods" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "timetableId" uuid NOT NULL,
        "subjectId" uuid NOT NULL,
        "teacherId" uuid NOT NULL,
        "dayOfWeek" integer NOT NULL,
        "startTime" TIME NOT NULL,
        "endTime" TIME NOT NULL,
        "room" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_periods" PRIMARY KEY ("id"),
        CONSTRAINT "FK_periods_timetable" FOREIGN KEY ("timetableId")
          REFERENCES "timetables"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_periods_tenantId" ON "periods" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_periods_branchId" ON "periods" ("branchId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_periods_timetableId" ON "periods" ("timetableId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_periods_teacherId" ON "periods" ("teacherId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_periods_tenant_teacher_day_start" ON "periods" ("tenantId", "teacherId", "dayOfWeek", "startTime")`,
    );

    // ─── 3. branch_income ──────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "branch_income" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "category" character varying NOT NULL,
        "description" character varying,
        "amount" decimal(12,2) NOT NULL,
        "date" date NOT NULL,
        "referenceNumber" character varying,
        "receivedFrom" character varying,
        "remarks" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_branch_income" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_branch_income_tenantId" ON "branch_income" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_branch_income_branchId" ON "branch_income" ("branchId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_branch_income_category" ON "branch_income" ("category")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_branch_income_date" ON "branch_income" ("date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_branch_income_tenant_branch_date" ON "branch_income" ("tenantId", "branchId", "date")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse dependency order
    await queryRunner.query(`DROP TABLE IF EXISTS "branch_income"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "periods"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "timetables"`);
  }
}
