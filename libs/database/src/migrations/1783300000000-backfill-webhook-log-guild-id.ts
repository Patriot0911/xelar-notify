import { MigrationInterface, QueryRunner } from "typeorm";

export class BackfillWebhookLogGuildId1783300000000 implements MigrationInterface {
    name = 'BackfillWebhookLogGuildId1783300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "notification_logs" AS log
            SET "guild_id" = webhook."discord_guild_id"
            FROM "webhook_notifications" AS webhook
            WHERE log."notification_id" = webhook."id"
              AND log."notification_type" = 'webhook'
              AND log."guild_id" IS NULL
              AND webhook."discord_guild_id" IS NOT NULL
        `);
    }

    public async down(): Promise<void> {
        // Data backfill only — not reversible without losing the original (incorrect) null state intentionally.
    }
}
