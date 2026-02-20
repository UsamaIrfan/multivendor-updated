import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExamResultPercentageAndRank1771600000000
  implements MigrationInterface
{
  name = 'AddExamResultPercentageAndRank1771600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exam_result" ADD "percentage" numeric(6,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "exam_result" ADD "rank" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exam_result" DROP COLUMN "rank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exam_result" DROP COLUMN "percentage"`,
    );
  }
}
