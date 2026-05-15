import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { DiscordNotificationDestinationEntity } from './notification-destination.entity';
import { TwitchStreamerEntity } from './twitch-streamer';
import { TwitchAppEntity } from './twitch-app.entity';

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

  @Column()
  streamerId: string;

  @Column()
  twitchAppId: string;

  @Column({ unique: true, type: 'varchar', nullable: true })
  subscriptionId?: string | null;

  @Column({ enum: TwitchStreamerEvents })
  event: TwitchStreamerEvents;

  @Column({ enum: TwitchEventStatuses })
  eventStatus: TwitchEventStatuses;

  @ManyToOne(() => TwitchStreamerEntity, (streamer) => streamer.eventSubscriptions)
  @JoinColumn({ name: 'streamer_id' })
  streamer: TwitchStreamerEntity;

  @ManyToOne(() => TwitchAppEntity, (twitchApp) => twitchApp.twitchStreamerEvents)
  @JoinColumn({ name: 'twitch_app_id' })
  twitchApp: TwitchAppEntity;

  @OneToMany(
    () => DiscordNotificationDestinationEntity,
    (dest) => dest.streamerEvent,
    { cascade: true }
  )
  discordDestinations: DiscordNotificationDestinationEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
