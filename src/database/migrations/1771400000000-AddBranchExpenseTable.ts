import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBranchExpenseTable1771400000000 implements MigrationInterface {
  name = 'AddBranchExpenseTable1771400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Reuse existing expense_status_enum type if exists
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'branch_expense_status_enum') THEN
          CREATE TYPE "public"."branch_expense_status_enum" AS ENUM('pending', 'approved', 'paid', 'rejected');
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      CREATE TABLE "branch_expense" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "category" character varying NOT NULL,
        "description" character varying,
        "amount" numeric(12,2) NOT NULL,
        "date" date NOT NULL,
        "referenceNumber" character varying,
        "paidTo" character varying,
        "status" "public"."branch_expense_status_enum" NOT NULL DEFAULT 'pending',
        "remarks" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_branch_expense" PRIMARY KEY ("id")
      )
    `);

    // Composite index for tenant + branch + date filtering
    await queryRunner.query(`
      CREATE INDEX "IDX_branch_expense_tenant_branch_date"
      ON "branch_expense" ("tenantId", "branchId", "date")
    `);

    // Category index for report filtering
    await queryRunner.query(`
      CREATE INDEX "IDX_branch_expense_category"
      ON "branch_expense" ("category")
    `);

    // Date index for date-range queries
    await queryRunner.query(`
      CREATE INDEX "IDX_branch_expense_date"
      ON "branch_expense" ("date")
    `);

    // Tenant index for tenant-scoped queries
    await queryRunner.query(`
      CREATE INDEX "IDX_branch_expense_tenantId"
      ON "branch_expense" ("tenantId")
    `);

    // Branch index for branch-scoped queries
    await queryRunner.query(`
      CREATE INDEX "IDX_branch_expense_branchId"
      ON "branch_expense" ("branchId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "branch_expense"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."branch_expense_status_enum"`,
    );
  }
}
