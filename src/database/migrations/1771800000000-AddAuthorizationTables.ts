import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthorizationTables1771800000000 implements MigrationInterface {
  name = 'AddAuthorizationTables1771800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── permission table ────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "permission" (
        "id" SERIAL NOT NULL,
        "code" character varying(100) NOT NULL,
        "domain" character varying(50) NOT NULL,
        "description" character varying(255),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_permission_code" UNIQUE ("code"),
        CONSTRAINT "PK_permission" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_permission_domain" ON "permission" ("domain")`,
    );

    // ─── permission_scope enum ───────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "permission_scope_enum" AS ENUM (
          'platform', 'tenant', 'branch', 'section', 'self', 'parent'
        );
      EXCEPTION WHEN duplicate_object THEN null;
      END $$
    `);

    // ─── role_permission table ───────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "role_permission" (
        "id" SERIAL NOT NULL,
        "roleId" integer NOT NULL,
        "permissionId" integer NOT NULL,
        "scope" "permission_scope_enum" NOT NULL DEFAULT 'tenant',
        CONSTRAINT "UQ_role_permission" UNIQUE ("roleId", "permissionId"),
        CONSTRAINT "PK_role_permission" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "role_permission"
        ADD CONSTRAINT "FK_role_permission_role"
        FOREIGN KEY ("roleId") REFERENCES "role"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "role_permission"
        ADD CONSTRAINT "FK_role_permission_permission"
        FOREIGN KEY ("permissionId") REFERENCES "permission"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_role_permission_roleId" ON "role_permission" ("roleId")`,
    );

    // ─── permission_override_action enum ─────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "permission_override_action_enum" AS ENUM ('grant', 'revoke');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$
    `);

    // ─── user_permission_override table ──────────────────────────
    await queryRunner.query(`
      CREATE TABLE "user_permission_override" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "tenantId" uuid NOT NULL,
        "permissionId" integer NOT NULL,
        "action" "permission_override_action_enum" NOT NULL DEFAULT 'grant',
        "scope" "permission_scope_enum",
        "grantedBy" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_permission_override" UNIQUE ("userId", "tenantId", "permissionId"),
        CONSTRAINT "PK_user_permission_override" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "user_permission_override"
        ADD CONSTRAINT "FK_user_permission_override_user"
        FOREIGN KEY ("userId") REFERENCES "user"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "user_permission_override"
        ADD CONSTRAINT "FK_user_permission_override_tenant"
        FOREIGN KEY ("tenantId") REFERENCES "tenant"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "user_permission_override"
        ADD CONSTRAINT "FK_user_permission_override_permission"
        FOREIGN KEY ("permissionId") REFERENCES "permission"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "user_permission_override"
        ADD CONSTRAINT "FK_user_permission_override_grantedBy"
        FOREIGN KEY ("grantedBy") REFERENCES "user"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_user_permission_override_userId_tenantId" ON "user_permission_override" ("userId", "tenantId")`,
    );

    // ─── audit_log table ─────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "audit_log" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenantId" uuid NOT NULL,
        "userId" integer NOT NULL,
        "action" character varying(100) NOT NULL,
        "resourceType" character varying(50),
        "resourceId" character varying(50),
        "details" jsonb,
        "ipAddress" character varying(45),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_log" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_log_tenantId_createdAt" ON "audit_log" ("tenantId", "createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_log_userId" ON "audit_log" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_log_action" ON "audit_log" ("action")`,
    );

    // ─── Add userId column to student_guardian ───────────────────
    await queryRunner.query(`
      ALTER TABLE "student_guardian"
        ADD COLUMN IF NOT EXISTS "userId" integer
    `);
    await queryRunner.query(`
      ALTER TABLE "student_guardian"
        ADD CONSTRAINT "FK_student_guardian_user"
        FOREIGN KEY ("userId") REFERENCES "user"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_student_guardian_userId" ON "student_guardian" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop student_guardian userId
    await queryRunner.query(
      `ALTER TABLE "student_guardian" DROP CONSTRAINT IF EXISTS "FK_student_guardian_user"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_student_guardian_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_guardian" DROP COLUMN IF EXISTS "userId"`,
    );

    // Drop audit_log
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_log"`);

    // Drop user_permission_override
    await queryRunner.query(
      `DROP TABLE IF EXISTS "user_permission_override"`,
    );

    // Drop role_permission
    await queryRunner.query(`DROP TABLE IF EXISTS "role_permission"`);

    // Drop permission
    await queryRunner.query(`DROP TABLE IF EXISTS "permission"`);

    // Drop enums
    await queryRunner.query(
      `DROP TYPE IF EXISTS "permission_override_action_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "permission_scope_enum"`);
  }
}
