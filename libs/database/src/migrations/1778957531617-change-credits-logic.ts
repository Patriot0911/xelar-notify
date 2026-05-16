import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeCreditsLogic1778957531617 implements MigrationInterface {
    name = 'ChangeCreditsLogic1778957531617'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "public_credits_used"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "private_credits_used"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" ADD CONSTRAINT "UQ_8f214a6945ef00e6d5a78f8be70" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "credits_used" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" ADD CONSTRAINT "FK_8f214a6945ef00e6d5a78f8be70" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "twitch_streamer" DROP CONSTRAINT "FK_8f214a6945ef00e6d5a78f8be70"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "credits_used"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" DROP CONSTRAINT "UQ_8f214a6945ef00e6d5a78f8be70"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "private_credits_used" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "public_credits_used" integer NOT NULL DEFAULT '0'`);
    }

}
