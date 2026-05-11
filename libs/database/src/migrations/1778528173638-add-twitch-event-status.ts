import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTwitchEventStatus1778528173638 implements MigrationInterface {
    name = 'AddTwitchEventStatus1778528173638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" RENAME COLUMN "payload" TO "eventStatus"`);
        await queryRunner.query(`ALTER TABLE "twitch_apps" DROP COLUMN "clusterTag"`);
        await queryRunner.query(`ALTER TABLE "notification_destinations" ADD "payload" text`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP COLUMN "eventStatus"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD "eventStatus" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD CONSTRAINT "UQ_1b150333a53b55767e13f367a8d" UNIQUE ("event", "streamerId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP CONSTRAINT "UQ_1b150333a53b55767e13f367a8d"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP COLUMN "eventStatus"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD "eventStatus" text`);
        await queryRunner.query(`ALTER TABLE "notification_destinations" DROP COLUMN "payload"`);
        await queryRunner.query(`ALTER TABLE "twitch_apps" ADD "clusterTag" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" RENAME COLUMN "eventStatus" TO "payload"`);
    }

}
