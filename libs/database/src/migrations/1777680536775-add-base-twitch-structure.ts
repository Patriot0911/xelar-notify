import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBaseTwitchStructure1777680536775 implements MigrationInterface {
    name = 'AddBaseTwitchStructure1777680536775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "twitch_streamer_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event" integer NOT NULL, "payload" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "streamerId" uuid, "twitchAppId" uuid, CONSTRAINT "PK_99ad8cf2f5e104ac587d0385c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "twitch_apps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "clientId" character varying NOT NULL, "client_secret" character varying NOT NULL, "access_token" character varying, "tokenExpiresAt" TIMESTAMP, "currentCost" integer NOT NULL DEFAULT '0', "maxCost" integer NOT NULL DEFAULT '9000', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_25ea1660099082d7896311453fb" UNIQUE ("clientId"), CONSTRAINT "PK_486ab8efbf04eb793fb7d188f30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "twitch_broadcast_subscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "twitchAppId" uuid, CONSTRAINT "PK_e4f9e03911e4096c75639d9775c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "twitch_streamer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "twitchLogin" character varying NOT NULL, "displayName" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "broadcastSubscriptionId" uuid, CONSTRAINT "UQ_2d84676a48249a92cf693422c26" UNIQUE ("twitchLogin"), CONSTRAINT "REL_1edaee24a3db75f2781102370b" UNIQUE ("broadcastSubscriptionId"), CONSTRAINT "PK_893ec973dcc92622ed060f914db" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "discordRefreshToken" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "twitchAccountId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_f568dd633964988b5e6dfcb1734" UNIQUE ("twitchAccountId")`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD CONSTRAINT "FK_1b6089d07c5e16caf80d1a6c971" FOREIGN KEY ("streamerId") REFERENCES "twitch_streamer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" ADD CONSTRAINT "FK_a3b342200b61eef4771525f5740" FOREIGN KEY ("twitchAppId") REFERENCES "twitch_apps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "twitch_broadcast_subscription" ADD CONSTRAINT "FK_43f43606690d3d1f24c3e552040" FOREIGN KEY ("twitchAppId") REFERENCES "twitch_apps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" ADD CONSTRAINT "FK_1edaee24a3db75f2781102370b8" FOREIGN KEY ("broadcastSubscriptionId") REFERENCES "twitch_broadcast_subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_f568dd633964988b5e6dfcb1734" FOREIGN KEY ("twitchAccountId") REFERENCES "twitch_streamer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_f568dd633964988b5e6dfcb1734"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer" DROP CONSTRAINT "FK_1edaee24a3db75f2781102370b8"`);
        await queryRunner.query(`ALTER TABLE "twitch_broadcast_subscription" DROP CONSTRAINT "FK_43f43606690d3d1f24c3e552040"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP CONSTRAINT "FK_a3b342200b61eef4771525f5740"`);
        await queryRunner.query(`ALTER TABLE "twitch_streamer_events" DROP CONSTRAINT "FK_1b6089d07c5e16caf80d1a6c971"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_f568dd633964988b5e6dfcb1734"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "twitchAccountId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "discordRefreshToken"`);
        await queryRunner.query(`DROP TABLE "twitch_streamer"`);
        await queryRunner.query(`DROP TABLE "twitch_broadcast_subscription"`);
        await queryRunner.query(`DROP TABLE "twitch_apps"`);
        await queryRunner.query(`DROP TABLE "twitch_streamer_events"`);
    }

}
