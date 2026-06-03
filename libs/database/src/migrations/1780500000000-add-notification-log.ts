import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationLog1780500000000 implements MigrationInterface {
  name = 'AddNotificationLog1780500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "notification_logs_type_enum" AS ENUM ('discord', 'webhook')
    `);
    await queryRunner.query(`
      CREATE TYPE "notification_logs_status_enum" AS ENUM ('sent', 'failed')
    `);
    await queryRunner.query(`
      CREATE TABLE "notification_logs" (
        "id"                UUID              NOT NULL DEFAULT uuid_generate_v4(),
        "notification_id"   UUID              NOT NULL,
        "notification_type" "notification_logs_type_enum" NOT NULL,
        "status"            "notification_logs_status_enum" NOT NULL,
        "owner_id"          UUID              NOT NULL,
        "guild_id"          CHARACTER VARYING,
        "streamer_login"    CHARACTER VARYING NOT NULL,
        "event_type"        CHARACTER VARYING NOT NULL,
        "request_payload"   JSONB,
        "error_message"     TEXT,
        "created_at"        TIMESTAMPTZ       NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_notification_logs_owner_created"
        ON "notification_logs" ("owner_id", "created_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_notification_logs_guild_created"
        ON "notification_logs" ("guild_id", "created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_notification_logs_guild_created"`);
    await queryRunner.query(`DROP INDEX "IDX_notification_logs_owner_created"`);
    await queryRunner.query(`DROP TABLE "notification_logs"`);
    await queryRunner.query(`DROP TYPE "notification_logs_status_enum"`);
    await queryRunner.query(`DROP TYPE "notification_logs_type_enum"`);
  }
}
