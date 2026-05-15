import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TwitchStreamerEventEntity } from './twitch-streamer-event';
import { TDiscordWebhookPayload } from 'apps/api/src/modules/notification-payload/schemas';
import { UserEntity } from './user.entity';

export enum NotificationPlatform {
  DISCORD_BOT     = 'discord_bot',
  DISCORD_WEBHOOK = 'discord_webhook',
};

@Entity('discord_notification_destinations')
export class DiscordNotificationDestinationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  streamerEventId: string;

  @ManyToOne(
    () => UserEntity,
    (user) => user.discordNotifications,
  )
  @JoinColumn({ name: 'credit_owner_id' })
  creditOwner: UserEntity;

  @Column({ type: 'varchar', name: 'credit_owner_id' })
  creditOwnerId: string;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  creditCost: number;

  @Column({ type: 'enum', enum: NotificationPlatform })
  type: NotificationPlatform;

  // discord_bot
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
    (event) => event.discordDestinations,
  )
  @JoinColumn({ name: 'streamer_event_id' })
  streamerEvent: TwitchStreamerEventEntity;

  @Column({ type: 'jsonb', nullable: true })
  messagePayload: TDiscordWebhookPayload | null;

  @CreateDateColumn()
  createdAt: Date;
}