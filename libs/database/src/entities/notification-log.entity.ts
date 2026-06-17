import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum NotificationLogType {
  Discord = 'discord',
  Webhook = 'webhook',
};

export enum NotificationLogStatus {
  Sent = 'sent',
  Failed = 'failed',
};

@Entity('notification_logs')
@Index(['ownerId', 'createdAt'])
@Index(['discordGuildId', 'createdAt'])
export class NotificationLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'notification_id', type: 'uuid' })
  notificationId: string;

  @Column({ name: 'notification_type', type: 'enum', enum: NotificationLogType, enumName: 'notification_logs_type_enum' })
  notificationType: NotificationLogType;

  @Column({ name: 'status', type: 'enum', enum: NotificationLogStatus, enumName: 'notification_logs_status_enum' })
  status: NotificationLogStatus;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ name: 'guild_id', type: 'varchar', nullable: true })
  discordGuildId?: string | null;

  @Column({ name: 'streamer_login', type: 'varchar' })
  streamerLogin: string;

  @Column({ name: 'event_type', type: 'varchar' })
  eventType: string;

  @Column({ name: 'request_payload', type: 'jsonb', nullable: true })
  requestPayload?: Record<string, any> | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
