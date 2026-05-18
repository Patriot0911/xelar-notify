import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { UserEntity } from './user.entity';

export enum Permission {
  ADMIN = 'admin',

  READ_APPS = 'read_apps',
  MANAGE_APPS = 'manage_apps',
};

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: 0, })
  rolePriority: number;

  @Column({
    type: 'enum',
    enum: Permission,
    array: true,
  })
  permissions: Permission[];

  @ManyToMany(() => UserEntity, user => user.roles)
  users: UserEntity[];
}
