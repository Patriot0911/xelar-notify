import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TwitchStreamerEntity } from './twitch-streamer';
import { TwitchAppEntity } from './twitch-app.entity';

export enum TwitchStreamerEvents {
}

@Entity('twitch_streamer_events')
export class TwitchStreamerEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ enum: TwitchStreamerEvents })
  event: TwitchStreamerEvents;

  @ManyToOne(() => TwitchStreamerEntity, (streamer) => streamer.personalEvents)
  streamer: TwitchStreamerEntity;

  @ManyToOne(() => TwitchAppEntity, (twitchApp) => twitchApp.twitchStreamerEvents)
  twitchApp: TwitchAppEntity;

  @Column({ type: 'text', nullable: true })
  payload?: string;

  @CreateDateColumn()
  createdAt: Date;
}
