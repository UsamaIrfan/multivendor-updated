import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvitationTable1771700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create invitation_status enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "invitation_status_enum" AS ENUM ('pending', 'accepted', 'expired', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create invitation table
    await queryRunner.query(`
      CREATE TABLE "invitation" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "branchId" uuid,
        "email" character varying NOT NULL,
        "roleId" integer NOT NULL,
        "status" "invitation_status_enum" NOT NULL DEFAULT 'pending',
        "invitedBy" integer NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_invitation" PRIMARY KEY ("id"),
        CONSTRAINT "FK_invitation_tenant" FOREIGN KEY ("tenantId")
          REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_invitation_tenantId" ON "invitation" ("tenantId");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_invitation_tenantId_email" ON "invitation" ("tenantId", "email");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invitation_tenantId_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invitation_tenantId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invitation"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "invitation_status_enum"`);
  }
}
