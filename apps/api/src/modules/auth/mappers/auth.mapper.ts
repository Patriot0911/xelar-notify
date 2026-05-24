import { UserEntity } from '@libs/database';
import { Injectable } from '@nestjs/common';
import { IAuthResponse, ITokenModel, IUserPayload } from '../models';
import { RolesMapper } from '../../roles/mappers';

@Injectable()
export class AuthMapper {
  constructor(
    private readonly rolesMapper: RolesMapper,
  ) {}

  toAuthResponse(user: UserEntity, tokens: ITokenModel): IAuthResponse {
    return {
      tokens,
      user: this.toUserPayload(user),
    };
  }

  toUserPayload(user: UserEntity): IUserPayload {
    const rolesData = user.roles;
    const { permissions, roles, } = this.rolesMapper.rolesToAccess(rolesData);
    return {
      id: user.id,
      displayName: user.displayName,
      discordId: user.discordId,
      permissions,
      roles,
    };
  }
}
