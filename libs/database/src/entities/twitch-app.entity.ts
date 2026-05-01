import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TwitchStreamerEventEntity } from './twitch-streamer-event';
import { TwitchBroadcastSubscriptionEntity } from './twitch-broadcast-subscription';

@Entity('twitch_apps')
export class TwitchAppEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  clientId: string;

  @Column()
  clientSecret: string;

  @Column({ nullable: true })
  accessToken?: string;

  @Column({ nullable: true })
  tokenExpiresAt?: number;

  @Column({ default: 0 })
  currentCost: number;

  @Column({ default: 9000 })
  maxCost: number;

  @OneToMany(() => TwitchStreamerEventEntity, (streamerEvent) => streamerEvent.twitchApp)
  twitchStreamerEvents: TwitchStreamerEventEntity[];

  @OneToMany(() => TwitchBroadcastSubscriptionEntity, (twitchBroadcast) => twitchBroadcast.twitchApp)
  twitchBroadcastEvents: TwitchBroadcastSubscriptionEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
