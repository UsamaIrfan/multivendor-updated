import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakePrimaryBranchIdNullable1771600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "staff_mgmt" ALTER COLUMN "primaryBranchId" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Set existing NULLs to a placeholder before re-adding NOT NULL
    await queryRunner.query(
      `UPDATE "staff_mgmt" SET "primaryBranchId" = '00000000-0000-0000-0000-000000000000' WHERE "primaryBranchId" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_mgmt" ALTER COLUMN "primaryBranchId" SET NOT NULL`,
    );
  }
}
