import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExamStatusAndNoticesTable1771500000000
  implements MigrationInterface
{
  name = 'AddExamStatusAndNoticesTable1771500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add exam_status_enum type + status column to exam table
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exam_status_enum') THEN
          CREATE TYPE "public"."exam_status_enum" AS ENUM('draft', 'scheduled', 'in_progress', 'completed', 'results_published');
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      ALTER TABLE "exam"
      ADD COLUMN IF NOT EXISTS "status" "public"."exam_status_enum" NOT NULL DEFAULT 'scheduled'
    `);

    // 2. Create notices table (new NoticesModule, separate from LMS notice table)
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);

    await queryRunner.query(`
      CREATE TABLE "notices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "targetBranches" text NOT NULL DEFAULT '',
        "targetRoles" text NOT NULL DEFAULT '',
        "title" character varying NOT NULL,
        "content" text NOT NULL,
        "attachments" text,
        "isPublished" boolean NOT NULL DEFAULT false,
        "publishDate" TIMESTAMP,
        "expiresAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_notices_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_notices_tenantId" ON "notices" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notices_branchId" ON "notices" ("branchId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notices_title" ON "notices" ("title")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notices_tenantId_createdAt" ON "notices" ("tenantId", "createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_notices_tenantId_createdAt"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notices_title"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notices_branchId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notices_tenantId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notices"`);

    await queryRunner.query(
      `ALTER TABLE "exam" DROP COLUMN IF EXISTS "status"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."exam_status_enum"`);
  }
}
