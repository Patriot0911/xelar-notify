import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('twitch_apps')
export class TwitchAppEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  clientId: string;

  @Column()
  clientSecret: string;

  @Column({ default: 0 })
  currentCost: number;

  @Column({ default: 9000 })
  maxCost: number;

  @CreateDateColumn()
  createdAt: Date;
}
