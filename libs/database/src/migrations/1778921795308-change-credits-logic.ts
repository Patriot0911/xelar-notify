import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeCreditsLogic1778921795308 implements MigrationInterface {
    name = 'ChangeCreditsLogic1778921795308'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "publicEvenetsCost"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "privateEvenetsCost"`);
        await queryRunner.query(`ALTER TABLE "discord_notification_destinations" ADD "credit_owner_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "discord_notification_destinations" ADD "creditCost" numeric(3,1) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "publicCreditsUsed" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "privateCreditsUsed" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "discord_notification_destinations" ADD CONSTRAINT "FK_359722f9345a48b43dcb1686e14" FOREIGN KEY ("credit_owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "discord_notification_destinations" DROP CONSTRAINT "FK_359722f9345a48b43dcb1686e14"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "privateCreditsUsed"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "publicCreditsUsed"`);
        await queryRunner.query(`ALTER TABLE "discord_notification_destinations" DROP COLUMN "creditCost"`);
        await queryRunner.query(`ALTER TABLE "discord_notification_destinations" DROP COLUMN "credit_owner_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "privateEvenetsCost" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "publicEvenetsCost" integer NOT NULL DEFAULT '0'`);
    }

}
