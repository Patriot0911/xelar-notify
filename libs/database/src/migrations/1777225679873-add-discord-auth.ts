import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDiscordAuth1777225679873 implements MigrationInterface {
    name = 'AddDiscordAuth1777225679873'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "discordAccessToken" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "discordAccessToken"`);
    }

}
