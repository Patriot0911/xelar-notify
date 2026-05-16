import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TwitchStreamerEventEntity } from './twitch-streamer-event';

export enum TwitchAppStatus {
  Active = 'active',
  Internal = 'internal',
  Locked = 'locked', // prevent from "least loaded"
};

@Entity('twitch_apps')
export class TwitchAppEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ enum: TwitchAppStatus, default: TwitchAppStatus.Active })
  status: TwitchAppStatus;

  @Column({ name: 'client_id', unique: true })
  clientId: string;

  @Column({ name: 'client_secret' })
  clientSecret: string;

  @Column({ name: 'webhook_secret' })
  webhookSecret: string;

  @Column({ name: 'access_token', nullable: true, type: 'varchar' })
  accessToken?: string | null;

  @Column({ name: 'token_expires_at', nullable: true })
  tokenExpiresAt?: Date;

  @Column({ name: 'current_cost', default: 0 })
  currentCost: number;

  @Column({ name: 'max_cost', default: 9000 })
  maxCost: number;

  @OneToMany(() => TwitchStreamerEventEntity, (streamerEvent) => streamerEvent.twitchApp)
  twitchStreamerEvents: TwitchStreamerEventEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
