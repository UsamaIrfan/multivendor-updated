import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixPeriodSubjectTeacherTypes1772000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Clear existing period data since we're changing column types from uuid to int
    await queryRunner.query(`DELETE FROM "periods"`);

    // Drop the composite index that references teacherId
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_periods_tenantId_teacherId_dayOfWeek_startTime"`,
    );
    // Drop the teacherId index
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_periods_teacherId"`);

    // Change subjectId from uuid to integer
    await queryRunner.query(`ALTER TABLE "periods" DROP COLUMN "subjectId"`);
    await queryRunner.query(
      `ALTER TABLE "periods" ADD "subjectId" integer NOT NULL`,
    );

    // Change teacherId from uuid to integer
    await queryRunner.query(`ALTER TABLE "periods" DROP COLUMN "teacherId"`);
    await queryRunner.query(
      `ALTER TABLE "periods" ADD "teacherId" integer NOT NULL`,
    );

    // Re-create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_periods_teacherId" ON "periods" ("teacherId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_periods_tenantId_teacherId_dayOfWeek_startTime" ON "periods" ("tenantId", "teacherId", "dayOfWeek", "startTime")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Clear data since we're changing back to uuid
    await queryRunner.query(`DELETE FROM "periods"`);

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_periods_tenantId_teacherId_dayOfWeek_startTime"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_periods_teacherId"`);

    // Revert teacherId back to uuid
    await queryRunner.query(`ALTER TABLE "periods" DROP COLUMN "teacherId"`);
    await queryRunner.query(
      `ALTER TABLE "periods" ADD "teacherId" uuid NOT NULL`,
    );

    // Revert subjectId back to uuid
    await queryRunner.query(`ALTER TABLE "periods" DROP COLUMN "subjectId"`);
    await queryRunner.query(
      `ALTER TABLE "periods" ADD "subjectId" uuid NOT NULL`,
    );

    // Re-create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_periods_teacherId" ON "periods" ("teacherId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_periods_tenantId_teacherId_dayOfWeek_startTime" ON "periods" ("tenantId", "teacherId", "dayOfWeek", "startTime")`,
    );
  }
}
