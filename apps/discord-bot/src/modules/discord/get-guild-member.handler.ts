import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Client, PermissionFlagsBits } from 'discord.js';
import { RpcPatterns } from '@libs/rpc/patterns';
import { DISCORD_CLIENT } from '../../shared/constants';

interface IGetGuildMemberPayload {
  guildId: string;
  discordUserId: string;
}

interface IGuildMemberRolesResult {
  roles: string[];
  isAdministrator: boolean;
}

@Controller()
export class GetGuildMemberHandler {
  constructor(
    @Inject(DISCORD_CLIENT)
    private readonly client: Client,
  ) {}

  @MessagePattern(RpcPatterns.bot.getGuildMemberRoles)
  async handle(
    @Payload() { guildId, discordUserId }: IGetGuildMemberPayload,
  ): Promise<IGuildMemberRolesResult> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) return { roles: [], isAdministrator: false };

    const member = await guild.members
      .fetch({ user: discordUserId, cache: true })
      .catch(() => null);

    if (!member) return { roles: [], isAdministrator: false };

    return {
      roles: [...member.roles.cache.keys()],
      isAdministrator: member.permissions.has(PermissionFlagsBits.Administrator),
    };
  }
}
