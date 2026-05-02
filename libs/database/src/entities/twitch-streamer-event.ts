import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { NotificationDestinationEntity } from './notification-destination.entity';
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

@Entity('twitch_streamer_events')
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

  @ManyToOne(() => TwitchStreamerEntity, (streamer) => streamer.eventSubscriptions)
  @JoinColumn({ name: 'streamer_id' })
  streamer: TwitchStreamerEntity;

  @ManyToOne(() => TwitchAppEntity, (twitchApp) => twitchApp.twitchStreamerEvents)
  @JoinColumn({ name: 'twitch_app_id' })
  twitchApp: TwitchAppEntity;

  @OneToMany(
    () => NotificationDestinationEntity,
    (dest) => dest.streamerEvent,
    { cascade: true }
  )
  destinations: NotificationDestinationEntity[];

  @Column({ type: 'text', nullable: true })
  payload?: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
