import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1777210052158 implements MigrationInterface {
    name = 'Init1777210052158'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "displayName" character varying NOT NULL, "email" character varying, "discordId" character varying, "password" character varying NOT NULL, "refreshToken" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_ae4a93a6b25195ccc2a97e13f0d" UNIQUE ("discordId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "streamers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "twitchLogin" character varying NOT NULL, "displayName" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_27e7dfa2d94ef73137dc3f43352" UNIQUE ("twitchLogin"), CONSTRAINT "PK_48125098658de7c988403e66e6b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "streamers"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
