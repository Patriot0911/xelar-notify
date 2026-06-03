import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuildManagerRole1780510000000 implements MigrationInterface {
  name = 'AddGuildManagerRole1780510000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "discord_guilds"
        ADD COLUMN "manager_role_id" CHARACTER VARYING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "discord_guilds"
        DROP COLUMN "manager_role_id"
    `);
  }
}
