import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TwitchBroadcastSubscriptionEntity } from './twitch-broadcast-subscription';
import { TwitchStreamerEventEntity } from './twitch-streamer-event';
import { UserEntity } from './user.entity';

@Entity('twitch_streamer')
export class TwitchStreamerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, })
  twitchLogin: string;

  @Column()
  displayName: string;

  @OneToOne(() => UserEntity, (user) => user.twitchAccount)
  user?: UserEntity;

  @OneToOne(
    () => TwitchBroadcastSubscriptionEntity,
    (broadcast) => broadcast.streamer,
    { cascade: true, }
  )
  @JoinColumn()
  broadcastSubscription?: TwitchBroadcastSubscriptionEntity;

  @OneToMany(
    () => TwitchStreamerEventEntity,
    (event) => event.streamer,
    { cascade: true, }
  )
  personalEvents: TwitchStreamerEventEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
