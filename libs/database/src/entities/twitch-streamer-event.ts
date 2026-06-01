import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { DiscordNotificationEntity } from './discord-notification.entity';
import { TwitchStreamerEntity } from './twitch-streamer';
import { TwitchAppEntity } from './twitch-app.entity';
import { WebhookNotificationEntity } from './webhook-notification.entity';

export enum TwitchStreamerEvents {
  STREAM_ONLINE     = 'stream.online',
  STREAM_OFFLINE    = 'stream.offline',
  CHANNEL_UPDATE    = 'channel.update',
  CHANNEL_RAID      = 'channel.raid',
  CHANNEL_SUBSCRIBE = 'channel.subscribe',
  CHANNEL_CHEER     = 'channel.cheer',
};

export enum TwitchEventStatuses {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REVOKED = 'revoked',
};

@Entity('twitch_streamer_events')
@Unique(['event', 'streamerId'])
export class TwitchStreamerEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'streamer_id' })
  streamerId: string;

  @Column({ name: 'twitch_app_id' })
  twitchAppId: string;

  @Column({ name: 'app_cost', type: 'decimal', precision: 3, scale: 1, default: 1 })
  appCost: number;

  @Column({ name: 'subscription_id', unique: true, type: 'varchar', nullable: true })
  subscriptionId?: string | null;

  @Column({ enum: TwitchStreamerEvents })
  event: TwitchStreamerEvents;

  @Column({ name: 'event_status', enum: TwitchEventStatuses })
  eventStatus: TwitchEventStatuses;

  @ManyToOne(() => TwitchStreamerEntity, (streamer) => streamer.eventSubscriptions)
  @JoinColumn({ name: 'streamer_id' })
  streamer: TwitchStreamerEntity;

  @ManyToOne(() => TwitchAppEntity, (twitchApp) => twitchApp.twitchStreamerEvents)
  @JoinColumn({ name: 'twitch_app_id' })
  twitchApp: TwitchAppEntity;

  @OneToMany(
    () => DiscordNotificationEntity,
    (dest) => dest.streamerEvent,
    { cascade: true }
  )
  discordNotifications: DiscordNotificationEntity[];

  @OneToMany(
    () => WebhookNotificationEntity,
    (dest) => dest.streamerEvent,
    { cascade: true }
  )
  webhookNotifications: WebhookNotificationEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
