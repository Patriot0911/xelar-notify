import { MigrationInterface, QueryRunner } from "typeorm";

export class GlobalDbChanges1780093794024 implements MigrationInterface {
    name = 'GlobalDbChanges1780093794024'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "discord_guilds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "balance" numeric(3,1) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0549d637a8cf188fc8290f4313b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."discord_notifications_status_enum" AS ENUM('active', 'suspended')`);
        await queryRunner.query(`CREATE TYPE "public"."discord_notifications_cost_type_enum" AS ENUM('personal', 'credit', 'guild')`);
        await queryRunner.query(`CREATE TABLE "discord_notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner_id" uuid NOT NULL, "cost" numeric(3,1) NOT NULL, "status" "public"."discord_notifications_status_enum" NOT NULL DEFAULT 'active', "cost_type" "public"."discord_notifications_cost_type_enum" NOT NULL, "channel_id" character varying NOT NULL, "guild_id" uuid NOT NULL, "streamer_event_id" uuid NOT NULL, "message_payload" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ea7621898107c04d155c86088f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."webhook_notifications_type_enum" AS ENUM('discord')`);
        await queryRunner.query(`CREATE TABLE "webhook_notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "streamer_event_id" uuid NOT NULL, "owner_id" uuid NOT NULL, "cost" numeric(3,1) NOT NULL, "is_credited" boolean NOT NULL DEFAULT false, "type" "public"."webhook_notifications_type_enum" NOT NULL, "webhook_url" character varying, "message_payload" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ae644eb6677f6e4ac17f6765399" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "credits_used"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" ADD "is_partner" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "balance" numeric(3,1) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "balance" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ADD "discord_token_expires_at" date`);
        await queryRunner.query(`ALTER TABLE "users" ADD "twitch_access_token" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "twitch_refresh_token" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "twitch_token_expires_at" date`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD "app_cost" numeric(3,1) NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "twitch_apps" ALTER COLUMN "max_cost" SET DEFAULT '9500'`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" ADD CONSTRAINT "FK_8c33ffefce3671373a0b4e7e27b" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" ADD CONSTRAINT "FK_639f7ddd705e903f45747ff1596" FOREIGN KEY ("guild_id") REFERENCES "discord_guilds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" ADD CONSTRAINT "FK_197b793441956ff312674aec7f0" FOREIGN KEY ("streamer_event_id") REFERENCES "twitch_streamer_events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" ADD CONSTRAINT "FK_ee6a4ddccab38ba7aba426bd620" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" ADD CONSTRAINT "FK_2a38b4fabdad616b95e14c6c322" FOREIGN KEY ("streamer_event_id") REFERENCES "twitch_streamer_events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhook_notifications" DROP CONSTRAINT "FK_2a38b4fabdad616b95e14c6c322"`);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" DROP CONSTRAINT "FK_ee6a4ddccab38ba7aba426bd620"`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" DROP CONSTRAINT "FK_197b793441956ff312674aec7f0"`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" DROP CONSTRAINT "FK_639f7ddd705e903f45747ff1596"`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" DROP CONSTRAINT "FK_8c33ffefce3671373a0b4e7e27b"`);
        await queryRunner.query(`ALTER TABLE "twitch_apps" ALTER COLUMN "max_cost" SET DEFAULT '9000'`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP COLUMN "app_cost"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "twitch_token_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "twitch_refresh_token"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "twitch_access_token"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "discord_token_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "balance"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" DROP COLUMN "is_partner"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "credits_used" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`DROP TABLE "webhook_notifications"`);
        await queryRunner.query(`DROP TYPE "public"."webhook_notifications_type_enum"`);
        await queryRunner.query(`DROP TABLE "discord_notifications"`);
        await queryRunner.query(`DROP TYPE "public"."discord_notifications_cost_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."discord_notifications_status_enum"`);
        await queryRunner.query(`DROP TABLE "discord_guilds"`);
    }

}
