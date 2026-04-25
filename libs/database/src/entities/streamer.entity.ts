import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('streamers')
export class Streamer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  twitchLogin: string;

  @Column()
  displayName: string;

  @CreateDateColumn()
  createdAt: Date;
}
