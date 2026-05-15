import { MigrationInterface, QueryRunner } from "typeorm";

export class AbstractDiscordNotifications1778874487532 implements MigrationInterface {
    name = 'AbstractDiscordNotifications1778874487532'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."discord_notification_destinations_type_enum" AS ENUM('discord_bot', 'discord_webhook')`);
        await queryRunner.query(`CREATE TABLE "discord_notification_destinations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "streamerEventId" character varying NOT NULL, "type" "public"."discord_notification_destinations_type_enum" NOT NULL, "channelId" character varying, "guildId" character varying, "webhookUrl" character varying, "messagePayload" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "streamer_event_id" uuid, CONSTRAINT "PK_e60d95df19f01a7d205d84cdc1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "publicEvenetsCost" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "privateEvenetsCost" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "discord_notification_destinations" ADD CONSTRAINT "FK_3a0238d3f6b2c360e0889496dc9" FOREIGN KEY ("streamer_event_id") REFERENCES "twitch_streamer_events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "discord_notification_destinations" DROP CONSTRAINT "FK_3a0238d3f6b2c360e0889496dc9"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "privateEvenetsCost"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "publicEvenetsCost"`);
        await queryRunner.query(`DROP TABLE "discord_notification_destinations"`);
        await queryRunner.query(`DROP TYPE "public"."discord_notification_destinations_type_enum"`);
    }
}
