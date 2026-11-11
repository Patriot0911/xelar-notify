import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationLogLastSentIndex1783400000000 implements MigrationInterface {
    name = 'AddNotificationLogLastSentIndex1783400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_notification_logs_notification_status_created"
            ON "notification_logs" ("notification_id", "status", "created_at")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notification_logs_notification_status_created"`);
    }
}
