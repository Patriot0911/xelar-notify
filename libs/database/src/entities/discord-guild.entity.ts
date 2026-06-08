import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DiscordNotificationEntity } from './discord-notification.entity';
import { WebhookNotificationEntity } from './webhook-notification.entity';

@Entity('discord_guilds')
export class DiscordGuildEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'guild_id', unique: true, })
  guildId: string;

  @OneToMany(
    () => DiscordNotificationEntity,
    (notification) => notification.discordGuild,
    { cascade: true }
  )
  notifications: DiscordNotificationEntity[];

  @OneToMany(
    () => WebhookNotificationEntity,
    (notification) => notification.discordGuild,
    { cascade: true }
  )
  webhookNotifications: WebhookNotificationEntity[];

  @Column({ name: 'manager_permission', type: 'varchar', nullable: true })
  managerPermission?: string | null;

  @Column({ name: 'balance', precision: 3, scale: 1, type: 'decimal', default: 0 })
  balance: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
