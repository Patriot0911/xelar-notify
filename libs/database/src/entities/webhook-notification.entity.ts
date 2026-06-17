import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TwitchStreamerEventEntity } from './twitch-streamer-event';
import { UserEntity } from './user.entity';
import { NotificationCostType } from './discord-notification.entity';
import { DiscordGuildEntity } from './discord-guild.entity';
import { NotificationStatus } from './notification-status.enum';

export enum WebhookType {
  DISCORD = 'discord',
};

@Entity('webhook_notifications')
export class WebhookNotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'streamer_event_id' })
  streamerEventId: string;

  @ManyToOne(
    () => UserEntity,
    (user) => user.webhookNotifications,
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
    enumName: 'webhook_notifications_status_enum',
    default: NotificationStatus.Active,
  })
  status: NotificationStatus;

  @Column({ name: 'cost_type', type: 'enum', enum: NotificationCostType, enumName: 'webhook_notifications_cost_type_enum' })
  costType: NotificationCostType;

  @Column({ type: 'enum', enum: WebhookType })
  type: WebhookType;

  @Column({ name: 'webhook_url', nullable: true, select: false, type: 'varchar' })
  webhookUrl?: string | null;

  @Column({ name: 'discord_guild_id', nullable: true, type: 'varchar',  })
  guildId?: string | null;

  @ManyToOne(
    () => DiscordGuildEntity,
    (guild) => guild.webhookNotifications,
  )
  @JoinColumn({ name: 'discord_guild_id' })
  guild?: DiscordGuildEntity;

  @ManyToOne(
    () => TwitchStreamerEventEntity,
    (event) => event.webhookNotifications,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'streamer_event_id' })
  streamerEvent: TwitchStreamerEventEntity;

  @Column({ name: 'message_payload', type: 'jsonb', nullable: true })
  messagePayload: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}