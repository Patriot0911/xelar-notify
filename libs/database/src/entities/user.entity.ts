import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  displayName: string;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  email?: string | null;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  discordId?: string | null;

  @Column()
  password: string;

  @Column({ nullable: true, type: 'varchar' })
  refreshToken?: string | null;

  // @Column({ unique: true, nullable: true })
  // telegramId?: string | null;

  // @Column({ unique: true, nullable: true })
  // twitchId?: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
