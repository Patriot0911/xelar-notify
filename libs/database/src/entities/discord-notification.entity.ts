import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TwitchStreamerEventEntity } from './twitch-streamer-event';
import { UserEntity } from './user.entity';
import { DiscordGuildEntity } from './discord-guild.entity';
import { NotificationStatus } from './notification-status.enum';

export enum NotificationCostType {
  Personal = 'personal',
  Credit = 'credit',
  Guild = 'guild',
};

@Entity('discord_notifications')
export class DiscordNotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => UserEntity,
    (user) => user.discordNotifications,
  )
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @Column({ type: 'varchar', name: 'owner_id' })
  onwerId: string;

  @Column({ name: 'cost', type: 'decimal', precision: 3, scale: 1 })
  cost: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.Active,
  })
  status: NotificationStatus;

  @Column({ type: 'boolean', name: 'is_disabled', default: false, nullable: true })
  isDisabled: boolean | null;

  @Column({ name: 'cost_type', type: 'enum', enum: NotificationCostType, enumName: 'discord_notifications_cost_type_enum' })
  costType: NotificationCostType;

  @Column({ name: 'channel_id', type: 'varchar' })
  channelId: string;

  @Column({ name: 'guild_id', type: 'varchar' })
  guildId: string;

  @ManyToOne(
    () => DiscordGuildEntity,
    (event) => event.notifications,
  )
  @JoinColumn({ name: 'guild_id' })
  guild: DiscordGuildEntity;

  @Column({ name: 'streamer_event_id' })
  streamerEventId: string;

  @ManyToOne(
    () => TwitchStreamerEventEntity,
    (event) => event.discordNotifications,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'streamer_event_id' })
  streamerEvent: TwitchStreamerEventEntity;

  @Column({ name: 'message_payload', type: 'jsonb', nullable: true })
  messagePayload: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}