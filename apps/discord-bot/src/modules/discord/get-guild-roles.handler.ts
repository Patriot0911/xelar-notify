import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Client } from 'discord.js';
import { RpcPatterns } from '@libs/rpc/patterns';
import { DISCORD_CLIENT } from '../../shared/constants';

interface IGetGuildRolesPayload {
  guildId: string;
}

interface IDiscordRoleResult {
  id: string;
  name: string;
  color: number;
  position: number;
  mentionable: boolean;
}

@Controller()
export class GetGuildRolesHandler {
  constructor(
    @Inject(DISCORD_CLIENT)
    private readonly client: Client,
  ) {}

  @MessagePattern(RpcPatterns.bot.getGuildRoles)
  handle(@Payload() { guildId }: IGetGuildRolesPayload): IDiscordRoleResult[] {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) return [];

    return [...guild.roles.cache.values()]
      .filter((r) => r.id !== guildId)
      .map((r) => ({
        id:          r.id,
        name:        r.name,
        color:       r.color,
        position:    r.position,
        mentionable: r.mentionable,
      }))
      .sort((a, b) => b.position - a.position);
  }
}
