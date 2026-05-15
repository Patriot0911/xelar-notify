import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { TwitchStreamerEntity } from './twitch-streamer';
import { DiscordNotificationDestinationEntity } from './notification-destination.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  displayName: string;

  // usage for public events (stream.online etc)
  @Column({ default: 0, type: 'int' })
  publicCreditsUsed: number;

  // usage for personal events as an account owner
  @Column({ default: 0, type: 'int' })
  privateCreditsUsed: number;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  email?: string | null;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  discordId?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  password?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  refreshToken?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  discordAccessToken?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  discordRefreshToken?: string | null; // Todo: add refresh in auth api

  @OneToMany(
    () => DiscordNotificationDestinationEntity,
    (dest) => dest.creditOwner,
    { cascade: true }
  )
  discordNotifications: DiscordNotificationDestinationEntity[];

  @OneToOne(
    () => TwitchStreamerEntity,
    (twitchAccount) => twitchAccount.user,
    { cascade: true, }
  )
  @JoinColumn()
  twitchAccount?: TwitchStreamerEntity;

  // @Column({ unique: true, nullable: true })
  // telegramId?: string | null;

  // @Column({ unique: true, nullable: true })
  // twitchId?: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
