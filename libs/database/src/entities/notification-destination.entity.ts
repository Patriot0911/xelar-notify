import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TwitchStreamerEventEntity } from './twitch-streamer-event';

export enum NotificationPlatform {
  DISCORD_BOT     = 'discord_bot',
  DISCORD_WEBHOOK = 'discord_webhook',
  TELEGRAM_BOT    = 'telegram_bot',
};

@Entity('notification_destinations')
export class NotificationDestinationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  streamerEventId: string;

  @Column({ type: 'enum', enum: NotificationPlatform })
  platform: NotificationPlatform;

  // discord_bot & telegram_bot (chatId)
  @Column({ nullable: true, type: 'varchar' })
  channelId?: string | null;

  // discord_bot
  @Column({ nullable: true, type: 'varchar' })
  guildId?: string | null;

  // discord_webhook
  @Column({ nullable: true, select: false, type: 'varchar' })
  webhookUrl?: string | null;

  @ManyToOne(
    () => TwitchStreamerEventEntity,
    (event) => event.destinations,
  )
  @JoinColumn({ name: 'streamer_event_id' })
  streamerEvent: TwitchStreamerEventEntity;

  @CreateDateColumn()
  createdAt: Date;
}