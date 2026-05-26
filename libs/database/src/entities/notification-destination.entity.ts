import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TwitchStreamerEventEntity } from './twitch-streamer-event';
import { UserEntity } from './user.entity';

export enum NotificationPlatform {
  DISCORD_BOT     = 'discord_bot',
  DISCORD_WEBHOOK = 'discord_webhook',
};

@Entity('discord_notification_destinations')
export class DiscordNotificationDestinationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'streamer_event_id' })
  streamerEventId: string;

  @ManyToOne(
    () => UserEntity,
    (user) => user.discordNotifications,
  )
  @JoinColumn({ name: 'credit_owner_id' })
  creditOwner: UserEntity;

  @Column({ type: 'varchar', name: 'credit_owner_id' })
  creditOwnerId: string;

  @Column({ name: 'credit_cost', type: 'decimal', precision: 3, scale: 1 })
  creditCost: number;

  @Column({ type: 'enum', enum: NotificationPlatform })
  type: NotificationPlatform;

  // discord_bot
  @Column({ name: 'channel_id', nullable: true, type: 'varchar' })
  channelId?: string | null;

  // discord_bot
  @Column({ name: 'guild_id', nullable: true, type: 'varchar' })
  guildId?: string | null;

  // discord_webhook
  @Column({ name: 'webhook_url', nullable: true, select: false, type: 'varchar' })
  webhookUrl?: string | null;

  @ManyToOne(
    () => TwitchStreamerEventEntity,
    (event) => event.discordDestinations,
  )
  @JoinColumn({ name: 'streamer_event_id' })
  streamerEvent: TwitchStreamerEventEntity;

  @Column({ name: 'message_payload', type: 'jsonb', nullable: true })
  messagePayload: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}