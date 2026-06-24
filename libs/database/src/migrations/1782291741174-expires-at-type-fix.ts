import { MigrationInterface, QueryRunner } from "typeorm";

export class ExpiresAtTypeFix1782291741174 implements MigrationInterface {
    name = 'ExpiresAtTypeFix1782291741174'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "discord_token_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "discord_token_expires_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "notification_logs" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "notification_logs" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_logs" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "notification_logs" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "discord_token_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "discord_token_expires_at" date`);
    }

}
