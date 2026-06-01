import { MigrationInterface, QueryRunner } from "typeorm";

export class CascadeDeleteNotificationsOnEvent1780400000000 implements MigrationInterface {
    name = 'CascadeDeleteNotificationsOnEvent1780400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "discord_notifications" DROP CONSTRAINT "FK_197b793441956ff312674aec7f0"`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" ADD CONSTRAINT "FK_197b793441956ff312674aec7f0" FOREIGN KEY ("streamer_event_id") REFERENCES "twitch_streamer_events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "webhook_notifications" DROP CONSTRAINT "FK_2a38b4fabdad616b95e14c6c322"`);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" ADD CONSTRAINT "FK_2a38b4fabdad616b95e14c6c322" FOREIGN KEY ("streamer_event_id") REFERENCES "twitch_streamer_events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhook_notifications" DROP CONSTRAINT "FK_2a38b4fabdad616b95e14c6c322"`);
        await queryRunner.query(`ALTER TABLE "webhook_notifications" ADD CONSTRAINT "FK_2a38b4fabdad616b95e14c6c322" FOREIGN KEY ("streamer_event_id") REFERENCES "twitch_streamer_events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "discord_notifications" DROP CONSTRAINT "FK_197b793441956ff312674aec7f0"`);
        await queryRunner.query(`ALTER TABLE "discord_notifications" ADD CONSTRAINT "FK_197b793441956ff312674aec7f0" FOREIGN KEY ("streamer_event_id") REFERENCES "twitch_streamer_events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
