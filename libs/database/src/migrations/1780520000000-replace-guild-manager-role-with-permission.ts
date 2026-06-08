import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaceGuildManagerRoleWithPermission1780520000000 implements MigrationInterface {
  name = 'ReplaceGuildManagerRoleWithPermission1780520000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "discord_guilds"
        RENAME COLUMN "manager_role_id" TO "manager_permission"
    `);
    await queryRunner.query(`
      UPDATE "discord_guilds" SET "manager_permission" = NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "discord_guilds" SET "manager_permission" = NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "discord_guilds"
        RENAME COLUMN "manager_permission" TO "manager_role_id"
    `);
  }
}
