import { CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TwitchStreamerEntity } from './twitch-streamer';
import { TwitchAppEntity } from './twitch-app.entity';

@Entity('twitch_broadcast_subscription')
export class TwitchBroadcastSubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => TwitchStreamerEntity, (streamer) => streamer.broadcastSubscription)
  streamer: TwitchStreamerEntity;

  @ManyToOne(() => TwitchAppEntity, (twitchApp) => twitchApp.twitchBroadcastEvents)
  twitchApp: TwitchAppEntity;

  @CreateDateColumn()
  createdAt: Date;
}
