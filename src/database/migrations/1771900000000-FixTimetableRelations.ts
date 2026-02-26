import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTimetableRelations1771900000000 implements MigrationInterface {
  name = 'FixTimetableRelations1771900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Delete existing data (old UUID values are invalid for integer FKs)
    await queryRunner.query(`DELETE FROM "periods"`);
    await queryRunner.query(`DELETE FROM "timetables"`);

    // 2. Drop old indexes that reference classId / academicYearId
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_timetables_classId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_timetables_academicYearId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_timetables_tenant_branch_class"`,
    );

    // 3. Drop old UUID columns
    await queryRunner.query(
      `ALTER TABLE "timetables" DROP COLUMN IF EXISTS "classId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetables" DROP COLUMN IF EXISTS "academicYearId"`,
    );

    // 4. Add integer FK columns
    await queryRunner.query(
      `ALTER TABLE "timetables" ADD "gradeClassId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetables" ADD "sectionId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetables" ADD "academicYearId" integer NOT NULL`,
    );

    // 5. Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "timetables" ADD CONSTRAINT "FK_timetables_gradeClass"
       FOREIGN KEY ("gradeClassId") REFERENCES "grade_class"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetables" ADD CONSTRAINT "FK_timetables_section"
       FOREIGN KEY ("sectionId") REFERENCES "section"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetables" ADD CONSTRAINT "FK_timetables_academicYear"
       FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE CASCADE`,
    );

    // 6. Create indexes on new FK columns
    await queryRunner.query(
      `CREATE INDEX "IDX_timetables_gradeClassId" ON "timetables" ("gradeClassId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_timetables_sectionId" ON "timetables" ("sectionId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_timetables_academicYearId" ON "timetables" ("academicYearId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_timetables_tenant_branch" ON "timetables" ("tenantId", "branchId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_timetables_tenant_branch"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_timetables_academicYearId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_timetables_sectionId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_timetables_gradeClassId"`,
    );

    // Drop FKs
    await queryRunner.query(
      `ALTER TABLE "timetables" DROP CONSTRAINT IF EXISTS "FK_timetables_academicYear"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetables" DROP CONSTRAINT IF EXISTS "FK_timetables_section"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetables" DROP CONSTRAINT IF EXISTS "FK_timetables_gradeClass"`,
    );

    // Drop new columns
    await queryRunner.query(
      `ALTER TABLE "timetables" DROP COLUMN IF EXISTS "academicYearId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetables" DROP COLUMN IF EXISTS "sectionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetables" DROP COLUMN IF EXISTS "gradeClassId"`,
    );

    // Restore old UUID columns
    await queryRunner.query(
      `ALTER TABLE "timetables" ADD "classId" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "timetables" ADD "academicYearId" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );

    // Restore old indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_timetables_classId" ON "timetables" ("classId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_timetables_academicYearId" ON "timetables" ("academicYearId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_timetables_tenant_branch_class" ON "timetables" ("tenantId", "branchId", "classId")`,
    );
  }
}
