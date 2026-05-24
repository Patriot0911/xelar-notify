import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { RolesMapper } from '../mappers';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission, RoleEntity, UserEntity } from '@libs/database';
import { MoreThan, Repository } from 'typeorm';
import { IGenericListPayloadResponse } from 'apps/api/src/shared';
import { ICreateRoleModel, IGetRolesFiltersModel, IRoleItemModel, IRoleListItemModel } from '../models';

@Injectable()
export class RolesService {
  constructor(
    private readonly rolesMapper: RolesMapper,
    @InjectRepository(RoleEntity)
    private rolesRepository: Repository<RoleEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
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

  async getAll(params: IGetRolesFiltersModel): Promise<IGenericListPayloadResponse<IRoleListItemModel>> {
    const { page, pageSize, search, } = params;
    const rolesQb = this.rolesRepository
      .createQueryBuilder('roles')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (search) {
      rolesQb.andWhere('roles.name LIKE :search', { search, });
    }

    const [rolesData, total] = await rolesQb
      .distinct(true)
      .getManyAndCount();

    return {
      items: rolesData.map(
        (r) => this.rolesMapper.entityToListItem(r)
      ),
      meta: { count: total, },
    };
  }

  async getById(id: string) {
    const role = await this.rolesRepository.findOneOrFail({
      where: { id, }
    });
    return this.rolesMapper.entityToItem(role);
  }

  async createRole(roleData: ICreateRoleModel, userId: string): Promise<IRoleItemModel> {
    const userData = await this.usersRepository.findOneOrFail({
      where: { id: userId, }
    });
    await this.checkUserRoleManageAccess(roleData.permissions, userData);
    const newRole = this.rolesRepository.create({
      name: roleData.name,
      permissions: roleData.permissions,
      rolePriority: roleData.rolePriority,
    },);
    const createdRole = await this.rolesRepository.save(newRole);
    return this.rolesMapper.entityToItem(createdRole);
  }

  async editRole(roleData: ICreateRoleModel, roleId: string, userId: string): Promise<boolean> {
    const currentRoleData = await this.rolesRepository.findOne({
      where: { id: roleId, },
      select: ['permissions', 'rolePriority'],
    });

    if (!currentRoleData) {
      throw new BadRequestException(`Cannot find role with id "${roleId}"`);
    }

    const userRole = await this.rolesRepository.findOne({
      where: {
        rolePriority: MoreThan(currentRoleData.rolePriority),
        users: [
          { id: userId, },
        ],
      },
      order: {
        rolePriority: 'DESC',
      },
    });

    if (
      (
        userRole
        && roleData.rolePriority
        && userRole.rolePriority <= roleData.rolePriority
      ) || !userRole
     ) {
      throw new ForbiddenException('Cannot edit role for higher prioirty');
    }

    const userData = await this.usersRepository.findOne({
      where: { id: userId, }
    });

    await this.checkUserRoleManageAccess(currentRoleData.permissions, userData!);
    await this.checkUserRoleManageAccess(roleData.permissions, userData!);

    const updatedRole = await this.rolesRepository.update(
      { id: roleId, },
      {
        name: roleData.name,
        permissions: roleData.permissions,
        rolePriority: roleData.rolePriority,
      },
    );
    return !!updatedRole.affected;
  }

  async deleteRole(roleId: string, userId: string): Promise<IRoleItemModel> {
    const roleData = await this.rolesRepository.findOne({
      where: { id: roleId, }
    });

    if (!roleData) {
      throw new BadRequestException(`Cannot find role with id "${roleId}"`);
    }

    await this.rolesRepository.findOneOrFail({
      where: {
        rolePriority: MoreThan(roleData.rolePriority),
        users: [
          { id: userId, },
        ],
      },
      order: {
        rolePriority: 'DESC',
      },
    });
    const removedRole = await this.rolesRepository.remove(roleData);
    return this.rolesMapper.entityToItem(removedRole);
  }

  async checkUserRoleManageAccess(permissions: Permission[], userData: UserEntity): Promise<boolean> {
    const userAccess = this.rolesMapper.rolesToAccess(userData?.roles ?? []);
    if (
      !userAccess.permissions.includes(Permission.ADMIN) &&
      permissions.some((permission) => !userAccess.permissions.includes(permission))
    ) {
      throw new ForbiddenException('Cannot performe action with not owned permission or without admin access');
    }
    return true;
  }
}