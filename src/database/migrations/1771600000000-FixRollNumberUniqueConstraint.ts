import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixRollNumberUniqueConstraint1771600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old global unique constraint on rollNumber
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_b9a599f176274d2cd1fe147653"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student" DROP CONSTRAINT IF EXISTS "UQ_b9a599f176274d2cd1fe147653a"`,
    );

    // Create a composite unique index scoped to tenantId
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_student_tenant_rollNumber" ON "student" ("tenantId", "rollNumber")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the composite index
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_student_tenant_rollNumber"`,
    );

    // Restore the global unique index
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b9a599f176274d2cd1fe147653" ON "student" ("rollNumber")`,
    );
  }
}
