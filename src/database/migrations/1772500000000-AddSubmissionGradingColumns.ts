import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubmissionGradingColumns1772500000000
  implements MigrationInterface
{
  name = 'AddSubmissionGradingColumns1772500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "assignment_submission"
        ADD COLUMN IF NOT EXISTS "grade" character varying,
        ADD COLUMN IF NOT EXISTS "feedback" text,
        ADD COLUMN IF NOT EXISTS "gradedAt" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "gradedBy" integer
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "assignment_submission"
        DROP COLUMN IF EXISTS "gradedBy",
        DROP COLUMN IF EXISTS "gradedAt",
        DROP COLUMN IF EXISTS "feedback",
        DROP COLUMN IF EXISTS "grade"
    `);
  }
}
