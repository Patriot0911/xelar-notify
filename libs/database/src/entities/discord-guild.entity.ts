import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DiscordNotificationEntity } from './discord-notification.entity';

@Entity('discord_guilds')
export class DiscordGuildEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(
    () => DiscordNotificationEntity,
    (dest) => dest.owner,
    { cascade: true }
  )
  notifications: DiscordNotificationEntity[];

  @Column({ name: 'balance', precision: 3, scale: 1, type: 'decimal', default: 0 })
  balance: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
