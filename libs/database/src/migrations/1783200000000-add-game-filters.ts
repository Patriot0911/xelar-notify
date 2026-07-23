import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGameFilters1783200000000 implements MigrationInterface {
    name = 'AddGameFilters1783200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "discord_notifications" ADD "game_filters" jsonb NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" ADD "game_filters" jsonb NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhook_notifications" DROP COLUMN "game_filters"`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" DROP COLUMN "game_filters"`);
    }
}
