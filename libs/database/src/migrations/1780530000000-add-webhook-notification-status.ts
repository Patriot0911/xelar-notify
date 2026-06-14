import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWebhookNotificationStatus1780530000000 implements MigrationInterface {
  name = 'AddWebhookNotificationStatus1780530000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "webhook_notifications_status_enum" AS ENUM ('active', 'suspended')
    `);
    await queryRunner.query(`
      ALTER TABLE "webhook_notifications"
        ADD COLUMN "status" "webhook_notifications_status_enum" NOT NULL DEFAULT 'active'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "webhook_notifications" DROP COLUMN "status"
    `);
    await queryRunner.query(`
      DROP TYPE "webhook_notifications_status_enum"
    `);
  }
}
