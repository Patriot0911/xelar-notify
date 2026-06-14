import { Injectable } from '@nestjs/common';
import { IDiscordApiGuildMemberModel, IDiscordApiGuildModel, IDiscordGuildMemberModel, IDiscordGuildModel } from '../models';
import { DiscordAuthMapper } from './discord-auth.mapper';

@Injectable()
export class DiscordGuildMapper {
  constructor(
    private readonly discordAuthMapper: DiscordAuthMapper,
  ) {}

  ApiToGuildModel(data: IDiscordApiGuildModel): IDiscordGuildModel {
    return {
      id: data.id,
      name: data.name,
      icon: data.icon,
      banner: data.banner,
      owner: data.owner,
      permissions: data.permissions,
      features: data.features,
      memberCount: data.approximate_member_count,
      presenceCount: data.approximate_presence_count,
    };
  }

  ApiToMemberModel(data: IDiscordApiGuildMemberModel): IDiscordGuildMemberModel {
    return {
      user: data.user
        ? this.discordAuthMapper.apiToMeModel(data.user)
        : undefined,
      nick: data.nick,
      avatar: data.avatar,
      premiumSince: data.premium_since,
      permissions: data.permissions,
      roles: data.roles,
      joinedAt: data.joined_at,
      deaf: data.deaf,
      mute: data.mute,
    };
  }
}
