import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { discordGuildRoles, RedisService } from '@libs/redis';
import { BOT_RPC_CLIENT } from '@libs/rpc';
import { RpcPatterns } from '@libs/rpc/patterns';
import type { IDiscordRoleModel } from '../models/discord-role.model';

const ROLES_TTL = 10 * 60 * 1000;

@Injectable()
export class DiscordRolesService {
  constructor(
    private readonly redis: RedisService,
    @Inject(BOT_RPC_CLIENT)
    private readonly botClient: ClientProxy,
  ) {}

  async getGuildRoles(guildId: string): Promise<IDiscordRoleModel[]> {
    const cached = await this.redis.get<IDiscordRoleModel[]>(discordGuildRoles(guildId));
    if (cached) return cached;

    const roles = await firstValueFrom(
      this.botClient
        .send<IDiscordRoleModel[]>(RpcPatterns.bot.getGuildRoles, { guildId })
        .pipe(timeout(8000)),
    );

    await this.redis.set(discordGuildRoles(guildId), roles, ROLES_TTL);
    return roles;
  }
}
