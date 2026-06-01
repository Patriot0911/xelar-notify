import { MigrationInterface, QueryRunner } from "typeorm";

export class CastNullToUserStreamer1780327124519 implements MigrationInterface {
    name = 'CastNullToUserStreamer1780327124519'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "twitch_streamer" DROP CONSTRAINT "FK_8f214a6945ef00e6d5a78f8be70"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."discord_notifications_cost_type_enum" RENAME TO "discord_notifications_cost_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."discord_notifications_cost_type_enum" AS ENUM('personal', 'credit', 'guild')`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" ALTER COLUMN "cost_type" TYPE "public"."discord_notifications_cost_type_enum" USING "cost_type"::"text"::"public"."discord_notifications_cost_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."discord_notifications_cost_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."webhook_notifications_cost_type_enum" RENAME TO "webhook_notifications_cost_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."webhook_notifications_cost_type_enum" AS ENUM('personal', 'credit', 'guild')`);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" ALTER COLUMN "cost_type" TYPE "public"."webhook_notifications_cost_type_enum" USING "cost_type"::"text"::"public"."webhook_notifications_cost_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."webhook_notifications_cost_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" ADD CONSTRAINT "FK_8f214a6945ef00e6d5a78f8be70" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "twitch_streamer" DROP CONSTRAINT "FK_8f214a6945ef00e6d5a78f8be70"`);
        await queryRunner.query(`CREATE TYPE "public"."webhook_notifications_cost_type_enum_old" AS ENUM('personal', 'credit', 'guild')`);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" ALTER COLUMN "cost_type" TYPE "public"."webhook_notifications_cost_type_enum_old" USING "cost_type"::"text"::"public"."webhook_notifications_cost_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."webhook_notifications_cost_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."webhook_notifications_cost_type_enum_old" RENAME TO "webhook_notifications_cost_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."discord_notifications_cost_type_enum_old" AS ENUM('personal', 'credit', 'guild')`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" ALTER COLUMN "cost_type" TYPE "public"."discord_notifications_cost_type_enum_old" USING "cost_type"::"text"::"public"."discord_notifications_cost_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."discord_notifications_cost_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."discord_notifications_cost_type_enum_old" RENAME TO "discord_notifications_cost_type_enum"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" ADD CONSTRAINT "FK_8f214a6945ef00e6d5a78f8be70" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
