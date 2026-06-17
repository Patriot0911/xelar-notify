import { UserEntity, UserSessionEntity } from '@libs/database';
import { Injectable } from '@nestjs/common';
import { IAuthResponse, ISessionModel, ITokenModel, IUserPayload } from '../models';
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
      twitchLogin: user.twitchAccount?.twitchLogin ?? null,
      allowPersonalSubscriptions: user.twitchAccount?.allowPersonalSubscriptions ?? false,
      permissions,
      balance: Number(user.balance),
      roles,
    };
  }

  toSessionDto(session: UserSessionEntity): ISessionModel {
    return {
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    };
  }
}
