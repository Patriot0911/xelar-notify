import { MigrationInterface, QueryRunner } from "typeorm";

export class FixNotificationRelations1780271792254 implements MigrationInterface {
    name = 'FixNotificationRelations1780271792254'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "discord_guilds" ADD "guild_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "discord_guilds" ADD CONSTRAINT "UQ_6b0bf64a0419a0879f85bb23718" UNIQUE ("guild_id")`);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" ADD "discord_guild_id" uuid`);
        await queryRunner.query(`ALTER TYPE "public"."discord_notifications_cost_type_enum" RENAME TO "discord_notifications_cost_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."discord_notifications_cost_type_enum" AS ENUM('personal', 'credit', 'guild')`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" ALTER COLUMN "cost_type" TYPE "public"."discord_notifications_cost_type_enum" USING "cost_type"::"text"::"public"."discord_notifications_cost_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."discord_notifications_cost_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."webhook_notifications_cost_type_enum" RENAME TO "webhook_notifications_cost_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."webhook_notifications_cost_type_enum" AS ENUM('personal', 'credit', 'guild')`);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" ALTER COLUMN "cost_type" TYPE "public"."webhook_notifications_cost_type_enum" USING "cost_type"::"text"::"public"."webhook_notifications_cost_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."webhook_notifications_cost_type_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_6b0bf64a0419a0879f85bb2371" ON "discord_guilds" ("guild_id") `);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" ADD CONSTRAINT "FK_cfef007fd83f175b14731666767" FOREIGN KEY ("discord_guild_id") REFERENCES "discord_guilds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhook_notifications" DROP CONSTRAINT "FK_cfef007fd83f175b14731666767"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6b0bf64a0419a0879f85bb2371"`);
        await queryRunner.query(`CREATE TYPE "public"."webhook_notifications_cost_type_enum_old" AS ENUM('personal', 'credit', 'guild')`);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" ALTER COLUMN "cost_type" TYPE "public"."webhook_notifications_cost_type_enum_old" USING "cost_type"::"text"::"public"."webhook_notifications_cost_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."webhook_notifications_cost_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."webhook_notifications_cost_type_enum_old" RENAME TO "webhook_notifications_cost_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."discord_notifications_cost_type_enum_old" AS ENUM('personal', 'credit', 'guild')`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" ALTER COLUMN "cost_type" TYPE "public"."discord_notifications_cost_type_enum_old" USING "cost_type"::"text"::"public"."discord_notifications_cost_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."discord_notifications_cost_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."discord_notifications_cost_type_enum_old" RENAME TO "discord_notifications_cost_type_enum"`);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" DROP COLUMN "discord_guild_id"`);
        await queryRunner.query(`ALTER TABLE "discord_guilds" DROP CONSTRAINT "UQ_6b0bf64a0419a0879f85bb23718"`);
        await queryRunner.query(`ALTER TABLE "discord_guilds" DROP COLUMN "guild_id"`);
    }

}
