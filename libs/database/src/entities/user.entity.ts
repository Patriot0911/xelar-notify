import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { TwitchStreamerEntity } from './twitch-streamer';
import { DiscordNotificationEntity } from './discord-notification.entity';
import { RoleEntity } from './role.entity';
import { UserSessionEntity } from './user-session.entity';
import { WebhookNotificationEntity } from './webhook-notification.entity';

export enum AccountStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
};

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ name: 'balance', precision: 3, scale: 1, type: 'decimal' })
  balance: number;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  email?: string | null;

  @Column({ name: 'discord_id', unique: true, nullable: true, type: 'varchar' })
  discordId?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  password?: string | null;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;

  @Column({ name: 'discord_access_token', nullable: true, type: 'varchar' })
  discordAccessToken?: string | null;

  @Column({ name: 'discord_refresh_token', nullable: true, type: 'varchar' })
  discordRefreshToken?: string | null;

  @Column({ name: 'discord_token_expires_at', nullable: true, type: 'timestamptz' })
  discordTokenExpiresAt?: Date | null;

  @Column({ name: 'twitch_access_token', nullable: true, type: 'varchar' })
  twitchAccessToken?: string | null;

  @Column({ name: 'twitch_refresh_token', nullable: true, type: 'varchar' })
  twitchRefreshToken?: string | null;

  @Column({ name: 'twitch_token_expires_at', nullable: true, type: 'timestamptz' })
  twitchTokenExpiresAt?: Date | null;

  @OneToMany(() => UserSessionEntity, (session) => session.user, { cascade: true })
  sessions: UserSessionEntity[];

  @OneToMany(
    () => DiscordNotificationEntity,
    (dest) => dest.owner,
    { cascade: true }
  )
  discordNotifications: DiscordNotificationEntity[];

  @OneToMany(
    () => WebhookNotificationEntity,
    (dest) => dest.owner,
    { cascade: true }
  )
  webhookNotifications: WebhookNotificationEntity[];

  @OneToOne(
    () => TwitchStreamerEntity,
    (twitchAccount) => twitchAccount.user,
    { cascade: true, }
  )
  @JoinColumn()
  twitchAccount?: TwitchStreamerEntity;

  @ManyToMany(() => RoleEntity, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}