import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsDisabledField1783159087616 implements MigrationInterface {
    name = 'AddIsDisabledField1783159087616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "discord_notifications" ADD "is_disabled" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" ADD "is_disabled" boolean DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhook_notifications" DROP COLUMN "is_disabled"`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" DROP COLUMN "is_disabled"`);
    }
}
