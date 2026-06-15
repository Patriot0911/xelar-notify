import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TwitchStreamerEventEntity } from './twitch-streamer-event';
import { UserEntity } from './user.entity';

@Entity('twitch_streamer')
export class TwitchStreamerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'broadcaster_id' })
  broadcasterId: string;

  @Column({ name: 'twitch_login', unique: true })
  twitchLogin: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ name: 'profile_image_url', type: 'varchar', nullable: true })
  profileImageUrl?: string | null;

  @Column({ name: 'profile_image_updated_at', type: 'timestamptz', nullable: true })
  profileImageUpdatedAt?: Date | null;

  @Column({ name: 'is_partner', default: false })
  isPartner: boolean;

  @Column({ name: 'user_id', nullable: true })
  userId?: string | null;

  @Column({ name: 'allow_personal_subscriptions', default: true })
  allowPersonalSubscriptions: boolean;

  @OneToOne(() => UserEntity, (user) => user.twitchAccount)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @OneToMany(
    () => TwitchStreamerEventEntity,
    (event) => event.streamer,
    { cascade: true, }
  )
  eventSubscriptions: TwitchStreamerEventEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
