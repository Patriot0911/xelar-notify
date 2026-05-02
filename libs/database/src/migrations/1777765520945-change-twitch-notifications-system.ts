import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTwitchNotificationsSystem1777765520945 implements MigrationInterface {
    name = 'ChangeTwitchNotificationsSystem1777765520945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP CONSTRAINT "FK_1b6089d07c5e16caf80d1a6c971"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP CONSTRAINT "FK_a3b342200b61eef4771525f5740"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" DROP CONSTRAINT "FK_1edaee24a3db75f2781102370b8"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" RENAME COLUMN "broadcastSubscriptionId" TO "broadcasterId"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_destinations_platform_enum" AS ENUM('discord_bot', 'discord_webhook', 'telegram_bot')`);
        await queryRunner.query(`CREATE TABLE "notification_destinations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "streamerEventId" character varying NOT NULL, "platform" "public"."notification_destinations_platform_enum" NOT NULL, "channelId" character varying, "guildId" character varying, "webhookUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "streamer_event_id" uuid, CONSTRAINT "PK_e928f2b463f90c61949d7113c88" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD "subscriptionId" character varying`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD CONSTRAINT "UQ_b03926b83345af03988b91047ea" UNIQUE ("subscriptionId")`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD "streamer_id" uuid`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD "twitch_app_id" uuid`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP COLUMN "streamerId"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD "streamerId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP COLUMN "twitchAppId"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD "twitchAppId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP COLUMN "event"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD "event" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" DROP COLUMN "broadcasterId"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" ADD "broadcasterId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification_destinations" ADD CONSTRAINT "FK_933f7ffebe83b68ee5892541b0e" FOREIGN KEY ("streamer_event_id") REFERENCES "twitch_streamer_events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD CONSTRAINT "FK_da0e3dcc3e1d212c321b3896f18" FOREIGN KEY ("streamer_id") REFERENCES "twitch_streamer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD CONSTRAINT "FK_c47002236e7f4235683b0a74f10" FOREIGN KEY ("twitch_app_id") REFERENCES "twitch_apps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP CONSTRAINT "FK_c47002236e7f4235683b0a74f10"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP CONSTRAINT "FK_da0e3dcc3e1d212c321b3896f18"`);
        await queryRunner.query(`ALTER TABLE "notification_destinations" DROP CONSTRAINT "FK_933f7ffebe83b68ee5892541b0e"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" DROP COLUMN "broadcasterId"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" ADD "broadcasterId" uuid`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP COLUMN "event"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD "event" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP COLUMN "twitchAppId"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD "twitchAppId" uuid`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP COLUMN "streamerId"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD "streamerId" uuid`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP COLUMN "twitch_app_id"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP COLUMN "streamer_id"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP CONSTRAINT "UQ_b03926b83345af03988b91047ea"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP COLUMN "subscriptionId"`);
        await queryRunner.query(`DROP TABLE "notification_destinations"`);
        await queryRunner.query(`DROP TYPE "public"."notification_destinations_platform_enum"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" RENAME COLUMN "broadcasterId" TO "broadcastSubscriptionId"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" ADD CONSTRAINT "FK_1edaee24a3db75f2781102370b8" FOREIGN KEY ("broadcastSubscriptionId") REFERENCES "twitch_broadcast_subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD CONSTRAINT "FK_a3b342200b61eef4771525f5740" FOREIGN KEY ("twitchAppId") REFERENCES "twitch_apps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD CONSTRAINT "FK_1b6089d07c5e16caf80d1a6c971" FOREIGN KEY ("streamerId") REFERENCES "twitch_streamer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
