import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TwitchStreamerEventEntity } from './twitch-streamer-event';
import { UserEntity } from './user.entity';

@Entity('twitch_streamer')
export class TwitchStreamerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  broadcasterId: string;

  @Column({ unique: true, })
  twitchLogin: string;

  @Column()
  displayName: string;

  @OneToOne(() => UserEntity, (user) => user.twitchAccount)
  user?: UserEntity;

  @OneToMany(
    () => TwitchStreamerEventEntity,
    (event) => event.streamer,
    { cascade: true, }
  )
  eventSubscriptions: TwitchStreamerEventEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
