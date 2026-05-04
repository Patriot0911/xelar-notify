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

  @Column()
  clusterTag: string;

  @Column({ unique: true })
  clientId: string;

  @Column({ name: 'client_secret' })
  clientSecret: string;

  @Column()
  webhookSecret: string;

  @Column({ nullable: true, type: 'varchar', name: 'access_token' })
  accessToken?: string | null;

  @Column({ nullable: true, })
  tokenExpiresAt?: Date;

  @Column({ default: 0 })
  currentCost: number;

  @Column({ default: 9000 })
  maxCost: number;

  @OneToMany(() => TwitchStreamerEventEntity, (streamerEvent) => streamerEvent.twitchApp)
  twitchStreamerEvents: TwitchStreamerEventEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
