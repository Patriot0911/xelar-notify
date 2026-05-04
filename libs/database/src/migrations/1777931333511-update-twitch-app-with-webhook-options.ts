import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTwitchAppWithWebhookOptions1777931333511 implements MigrationInterface {
    name = 'UpdateTwitchAppWithWebhookOptions1777931333511'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "twitch_apps" ADD "status" character varying NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "twitch_apps" ADD "clusterTag" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "twitch_apps" ADD "webhookSecret" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "twitch_apps" DROP COLUMN "webhookSecret"`);
        await queryRunner.query(`ALTER TABLE "twitch_apps" DROP COLUMN "clusterTag"`);
        await queryRunner.query(`ALTER TABLE "twitch_apps" DROP COLUMN "status"`);
    }

}
