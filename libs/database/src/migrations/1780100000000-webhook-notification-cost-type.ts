import { MigrationInterface, QueryRunner } from 'typeorm';

export class WebhookNotificationCostType1780100000000 implements MigrationInterface {
  name = 'WebhookNotificationCostType1780100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."webhook_notifications_cost_type_enum" AS ENUM('personal', 'credit', 'guild')`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_notifications" ADD "cost_type" "public"."webhook_notifications_cost_type_enum" NOT NULL DEFAULT 'personal'`,
    );
    await queryRunner.query(
      `UPDATE "webhook_notifications" SET "cost_type" = 'credit' WHERE "is_credited" = true`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_notifications" ALTER COLUMN "cost_type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_notifications" DROP COLUMN "is_credited"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "webhook_notifications" ADD "is_credited" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `UPDATE "webhook_notifications" SET "is_credited" = true WHERE "cost_type" = 'credit'`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_notifications" DROP COLUMN "cost_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."webhook_notifications_cost_type_enum"`,
    );
  }
}
