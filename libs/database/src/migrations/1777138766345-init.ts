import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1777138766345 implements MigrationInterface {
    name = 'Init1777138766345'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "streamers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "twitchLogin" character varying NOT NULL, "displayName" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_27e7dfa2d94ef73137dc3f43352" UNIQUE ("twitchLogin"), CONSTRAINT "PK_48125098658de7c988403e66e6b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "streamers"`);
    }

}
