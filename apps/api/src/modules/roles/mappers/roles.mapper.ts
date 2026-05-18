import { Injectable } from '@nestjs/common';
import { RoleEntity } from '@libs/database';
import { IAccessModel, IRoleDictionaryItemModel, IRoleItemModel, IRoleListItemModel } from '../models';

@Injectable()
export class RolesMapper {
  entityToListItem(role: RoleEntity): IRoleListItemModel {
    const { id, name, permissions, rolePriority, } = role;
    return { id, name, permissions, rolePriority, };
  }

  entityToItem(role: RoleEntity): IRoleItemModel {
    const { id, name, permissions, rolePriority, } = role;
    return { id, name, permissions, rolePriority, };
  }

  entityToDictionaryItem(role: RoleEntity): IRoleDictionaryItemModel {
    const { id, name, } = role;
    return { id, name, };
  }

  rolesToAccess(roles: RoleEntity[]): IAccessModel {
    const roleNames = roles.map(r => r.name);
    const aggregatedPermissions = [
      ...new Set(roles.flatMap(role => role.permissions),),
    ];
    return {
      roles: roleNames,
      permissions: aggregatedPermissions,
    };
  }
}
