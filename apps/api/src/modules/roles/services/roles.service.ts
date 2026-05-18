import { Injectable } from '@nestjs/common';
import { RolesMapper } from '../mappers';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from '@libs/database';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    private readonly rolesMapper: RolesMapper,
    @InjectRepository(RoleEntity)
    private rolesRepository: Repository<RoleEntity>,
  ) {}

  async getRolesAccessesForUser(userId: string) {
    const userRoles = await this.rolesRepository.find({
      where: {
        users: [
          { id: userId, },
        ],
      },
    });
    const { permissions, roles, } = this.rolesMapper.rolesToAccess(userRoles);
    return {
      permissions,
      roles,
    };
  }
}