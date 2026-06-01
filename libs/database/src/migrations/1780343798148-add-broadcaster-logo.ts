import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBroadcasterLogo1780343798148 implements MigrationInterface {
    name = 'AddBroadcasterLogo1780343798148'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "twitch_streamer" ADD "profile_image_url" character varying`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" ADD "profile_image_updated_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TYPE "public"."discord_notifications_cost_type_enum" RENAME TO "discord_notifications_cost_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."discord_notifications_cost_type_enum" AS ENUM('personal', 'credit', 'guild')`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" ALTER COLUMN "cost_type" TYPE "public"."discord_notifications_cost_type_enum" USING "cost_type"::"text"::"public"."discord_notifications_cost_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."discord_notifications_cost_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."webhook_notifications_cost_type_enum" RENAME TO "webhook_notifications_cost_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."webhook_notifications_cost_type_enum" AS ENUM('personal', 'credit', 'guild')`);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" ALTER COLUMN "cost_type" TYPE "public"."webhook_notifications_cost_type_enum" USING "cost_type"::"text"::"public"."webhook_notifications_cost_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."webhook_notifications_cost_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."webhook_notifications_cost_type_enum_old" AS ENUM('personal', 'credit', 'guild')`);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" ALTER COLUMN "cost_type" TYPE "public"."webhook_notifications_cost_type_enum_old" USING "cost_type"::"text"::"public"."webhook_notifications_cost_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."webhook_notifications_cost_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."webhook_notifications_cost_type_enum_old" RENAME TO "webhook_notifications_cost_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."discord_notifications_cost_type_enum_old" AS ENUM('personal', 'credit', 'guild')`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" ALTER COLUMN "cost_type" TYPE "public"."discord_notifications_cost_type_enum_old" USING "cost_type"::"text"::"public"."discord_notifications_cost_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."discord_notifications_cost_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."discord_notifications_cost_type_enum_old" RENAME TO "discord_notifications_cost_type_enum"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" DROP COLUMN "profile_image_updated_at"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" DROP COLUMN "profile_image_url"`);
    }

}
