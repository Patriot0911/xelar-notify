import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStreamerInternalFlag1782994146700 implements MigrationInterface {
    name = 'AddStreamerInternalFlag1782994146700'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "twitch_streamer" ADD "is_internal" boolean DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "twitch_streamer" DROP COLUMN "is_internal"`);
    }
}
