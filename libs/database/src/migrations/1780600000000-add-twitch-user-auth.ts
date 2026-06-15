import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTwitchUserAuth1780600000000 implements MigrationInterface {
  name = 'AddTwitchUserAuth1780600000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "twitch_token_expires_at" TYPE timestamptz`);
    await queryRunner.query(`ALTER TABLE "twitch_streamer" ADD "allow_personal_subscriptions" boolean NOT NULL DEFAULT true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "twitch_token_expires_at" TYPE date`);
    await queryRunner.query(`ALTER TABLE "twitch_streamer" DROP COLUMN "allow_personal_subscriptions"`);
  }
}
